import { IAssetManager, IAvatarFigureContainer, IAvatarImageListener } from '@volt/api';
import { GetAssetBundleUrl } from '@volt/assets';
import { GetConfiguration } from '@volt/configuration';
import { AvatarRenderLibraryEvent, GetEventDispatcher, VoltEvent, VoltEventType } from '@volt/events';
import { loadGamedata } from '@volt/utils';
import { AvatarAssetDownloadLibrary } from './AvatarAssetDownloadLibrary';
import { AvatarStructure } from './AvatarStructure';

export class AvatarAssetDownloadManager
{
    private _assets: IAssetManager;
    private _structure: AvatarStructure;

    private _missingMandatoryLibs: string[] = [];
    private _figureMap: Map<string, AvatarAssetDownloadLibrary[]> = new Map();
    private _figureListeners: Map<string, IAvatarImageListener[]> = new Map();
    private _incompleteFigures: Map<string, AvatarAssetDownloadLibrary[]> = new Map();
    private _currentDownloads: AvatarAssetDownloadLibrary[] = [];
    private _libraryNames: Set<string> = new Set();
    private _libraryLoadedCallback: (event: AvatarRenderLibraryEvent) => void = null;

    constructor(assets: IAssetManager, structure: AvatarStructure)
    {
        this._assets = assets;
        this._structure = structure;
    }

    private static DEFAULT_MANDATORY_LIBS: string[] = ['hh_human_face'];

    public async init(): Promise<void>
    {
        const configuredLibs = GetConfiguration().getValue<string[]>('avatar.mandatory.libraries') || [];

        this._missingMandatoryLibs = [ ...configuredLibs ];

        for(const lib of AvatarAssetDownloadManager.DEFAULT_MANDATORY_LIBS)
        {
            if(this._missingMandatoryLibs.indexOf(lib) === -1) this._missingMandatoryLibs.push(lib);
        }

        const url = GetConfiguration().getValue<string>('avatar.figuremap.url');

        if(!url || !url.length) throw new Error('Missing "avatar.figuremap.url" in config — add the figure map URL to your renderer-config.json');

        // Start downloading and decoding mandatory avatar bundles in parallel with FigureMap.json.
        const speculativeDownloads = this.startSpeculativeMandatoryDownloads();

        let responseData: any;

        try
        {
            // Split-aware loader (tier manifest -> per-tier files -> merged).
            // The figuremap URL is a directory manifest, not a single JSON, so a
            // raw fetch yields { tiers: [...] } with no `libraries` and avatars
            // silently render empty. loadGamedata handles both split + single.
            responseData = await loadGamedata(url);
        }
        catch (fetchErr)
        {
            throw new Error(`Could not load figure map from "${ url }" — check "avatar.figuremap.url" in renderer-config.json (${ fetchErr.message })`);
        }

        if(speculativeDownloads.length) await Promise.allSettled(speculativeDownloads);

        this.processFigureMap(responseData.libraries);

        // Store callback for cleanup
        this._libraryLoadedCallback = (event: AvatarRenderLibraryEvent) => this.onLibraryLoaded(event);
        GetEventDispatcher().addEventListener(VoltEventType.AVATAR_ASSET_DOWNLOADED, this._libraryLoadedCallback);

        await this.processMissingLibraries();
    }

    private startSpeculativeMandatoryDownloads(): Promise<boolean>[]
    {
        if(!this._assets || !this._missingMandatoryLibs.length) return [];

        const urls = new Set<string>();
        const downloadTemplate = GetConfiguration().getValue<string>('avatar.asset.url', '');

        try
        {
            const cached = JSON.parse(globalThis.localStorage?.getItem('volt.boot.mandatoryAvatarUrls') || 'null');

            if(Array.isArray(cached))
            {
                for(const entry of cached)
                {
                    if(typeof entry === 'string' && /^https?:\/\//i.test(entry)) urls.add(GetAssetBundleUrl(entry));
                }
            }
        }
        catch {}

        if(!urls.size && downloadTemplate)
        {
            for(const fallbackLib of ['hh_human_body', 'hh_human_item'])
            {
                urls.add(GetAssetBundleUrl(downloadTemplate.replace(/%libname%/gi, fallbackLib)));
            }
        }

        return [...urls].map(assetUrl => this._assets.downloadAsset(assetUrl));
    }

    public dispose(): void
    {
        if(this._libraryLoadedCallback)
        {
            GetEventDispatcher().removeEventListener(VoltEventType.AVATAR_ASSET_DOWNLOADED, this._libraryLoadedCallback);
            this._libraryLoadedCallback = null;
        }

        this._figureMap.clear();
        this._figureListeners.clear();
        this._incompleteFigures.clear();
        this._currentDownloads = [];
    }

    private processFigureMap(data: any): void
    {
        if(!data) return;

        const downloadUrl = GetConfiguration().getValue<string>('avatar.asset.url');

        for(const library of data)
        {
            if(!library) continue;

            const libraryName = (library.id as string);
            const revision = (library.revision || '');

            if(this._libraryNames.has(libraryName)) continue;

            this._libraryNames.add(libraryName);

            const downloadLibrary = new AvatarAssetDownloadLibrary(libraryName, revision, downloadUrl, this._assets);

            for(const part of (library.parts || []))
            {
                const id = (part.id as string);
                const type = (part.type as string);
                const partString = (type + ':' + id);

                let existing = this._figureMap.get(partString);

                if(!existing) existing = [];

                existing.push(downloadLibrary);

                this._figureMap.set(partString, existing);
            }
        }
    }

    private async processMissingLibraries(): Promise<void>
    {
        const promises: Promise<void>[] = [];
        const urls = new Set<string>();
        const downloadTemplate = GetConfiguration().getValue<string>('avatar.asset.url', '');

        this._missingMandatoryLibs.forEach(value =>
        {
            const libraries = this._figureMap.get(value);

            if(libraries)
            {
                for(const library of libraries)
                {
                    if(downloadTemplate) urls.add(GetAssetBundleUrl(downloadTemplate.replace(/%libname%/gi, library.libraryName)));
                    promises.push(library.downloadAsset());
                }
            }
        });

        this._missingMandatoryLibs = [];

        if(urls.size)
        {
            try
            {
                globalThis.localStorage?.setItem('volt.boot.mandatoryAvatarUrls', JSON.stringify([...urls]));
            }
            catch {}
        }

        await Promise.all(promises);
    }

    private onLibraryLoaded(event: AvatarRenderLibraryEvent): void
    {
        if(!event || !event.library) return;

        const loadedFigures: string[] = [];

        for(const [figure, libraries] of this._incompleteFigures.entries())
        {
            let isReady = true;

            for(const library of libraries)
            {
                if(!library || library.isLoaded) continue;

                isReady = false;

                break;
            }

            if(isReady)
            {
                loadedFigures.push(figure);

                const listeners = this._figureListeners.get(figure);

                if(listeners)
                {
                    for(const listener of listeners)
                    {
                        if(!listener || listener.disposed) continue;

                        listener.resetFigure(figure);
                    }
                }

                this._figureListeners.delete(figure);

                GetEventDispatcher().dispatchEvent(new VoltEvent(VoltEventType.AVATAR_ASSET_LOADED));
            }
        }

        for(const figure of loadedFigures)
        {
            if(!figure) continue;

            this._incompleteFigures.delete(figure);
        }

        let index = 0;

        while(index < this._currentDownloads.length)
        {
            const download = this._currentDownloads[index];

            if(download)
            {
                if(download.libraryName === event.library.libraryName) this._currentDownloads.splice(index, 1);
            }

            index++;
        }
    }

    public isAvatarFigureContainerReady(container: IAvatarFigureContainer): boolean
    {
        return !this.getAvatarFigurePendingLibraries(container).length;
    }

    private getAvatarFigurePendingLibraries(container: IAvatarFigureContainer): AvatarAssetDownloadLibrary[]
    {
        const pendingLibraries: AvatarAssetDownloadLibrary[] = [];

        if(!container || !this._structure) return pendingLibraries;

        const figureData = this._structure.figureData;

        if(!figureData) return pendingLibraries;

        const setKeys = container.getPartTypeIds();

        for(const key of setKeys)
        {
            const set = figureData.getSetType(key);

            if(!set) continue;

            const figurePartSet = set.getPartSet(container.getPartSetId(key));

            if(!figurePartSet) continue;

            for(const part of figurePartSet.parts)
            {
                if(!part) continue;

                const name = (part.type + ':' + part.id);
                const existing = this._figureMap.get(name);

                if(existing === undefined) continue;

                for(const library of existing)
                {
                    if(!library || library.isLoaded) continue;

                    if(pendingLibraries.indexOf(library) >= 0) continue;

                    pendingLibraries.push(library);
                }
            }
        }

        return pendingLibraries;
    }

    public isNftPartSet(partSet: { parts: { type: string, id: number }[] }): boolean
    {
        if(!partSet || !partSet.parts) return false;

        // NFT libraries re-declare shared base parts (hd:1, bd:1, lh:1,
        // rh:1, ...), so "any part in an NFT library" would classify base
        // figure sets as NFT. A set is NFT only when every library that can
        // serve one of its parts is an NFT library.
        const hasNftLibrary = false;

        for(const part of partSet.parts)
        {
            if(!part) continue;

            const name = (part.type + ':' + part.id);
            const libraries = this._figureMap.get(name);

            if(!libraries) continue;

            let hasNftLibrary = false;
            const hasStandardLibrary = false;

            for(const library of libraries)
            {
                if(!library) continue;

                if(!library.libraryName.toLowerCase().includes('nft')) return false;

                hasNftLibrary = true;
            }

            // Common body parts are intentionally repeated inside composite
            // NFT libraries. Only a part supplied exclusively by NFT assets is
            // evidence that the containing figure set is itself an NFT set.
            if(hasNftLibrary && !hasStandardLibrary) return true;
        }

        return hasNftLibrary;
    }

    public downloadAvatarFigure(container: IAvatarFigureContainer, listener: IAvatarImageListener): void
    {
        const figure = container.getFigureString();
        const pendingLibraries = this.getAvatarFigurePendingLibraries(container);

        if(pendingLibraries && pendingLibraries.length)
        {
            if(listener && !listener.disposed)
            {
                let listeners = this._figureListeners.get(figure);

                if(!listeners)
                {
                    listeners = [];

                    this._figureListeners.set(figure, listeners);
                }

                if(listeners.indexOf(listener) === -1) listeners.push(listener);
            }

            this._incompleteFigures.set(figure, pendingLibraries);

            for(const library of pendingLibraries)
            {
                if(!library) continue;

                library.downloadAsset();
            }
        }
        else
        {
            if(listener && !listener.disposed) listener.resetFigure(figure);
        }
    }
}
