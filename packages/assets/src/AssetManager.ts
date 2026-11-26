import { IAssetData, IAssetManager, IGraphicAsset, IGraphicAssetCollection } from '@volt/api';
import { HabBundle, VoltBundle, VoltBundleTextureDecoder, parseConfigJsonFromResponse } from '@volt/utils';
import { Spritesheet, SpritesheetData, Texture } from 'pixi.js';
import { AssetBundleFormat, GetAssetBundleFormat, GetAssetBundleUrl, isAssetBundleUrl } from './AssetBundleFormat';
import { assetImageFallbackUrl, isAssetJsonUrl } from './AssetJsonUrl';
import { GraphicAssetCollection } from './GraphicAssetCollection';
import { detectImageFormat, ImageLoadRequest, LoadedImageResource, loadImageResource } from './image';
import avatarAdditionsAssetData from './assets/avatar_additions/avatar_additions.asset.json';
import placeHolderAssetData from './assets/place_holder/place_holder.asset.json';
import placeHolderPetAssetData from './assets/place_holder_pet/place_holder_pet.asset.json';
import placeHolderWallAssetData from './assets/place_holder_wall/place_holder_wall.asset.json';
import roomAssetData from './assets/room/room.asset.json';
import selectionArrowAssetData from './assets/selection_arrow/selection_arrow.asset.json';
import tileCursorAssetData from './assets/tile_cursor/tile_cursor.asset.json';

export interface AssetManagerDependencies
{
    fetch(url: string): Promise<Response>;
    parseAssetData(response: Response, source: string): Promise<IAssetData>;
    loadImageResource(request: ImageLoadRequest): Promise<LoadedImageResource>;
    loadVoltBundle(buffer: ArrayBuffer, textureDecoder: VoltBundleTextureDecoder): Promise<VoltBundle>;
    loadHabBundle(buffer: ArrayBuffer, textureDecoder: VoltBundleTextureDecoder): Promise<HabBundle>;
    bundleFormat(): AssetBundleFormat;
}

const DEFAULT_DEPENDENCIES: AssetManagerDependencies = {
    fetch: url => globalThis.fetch(url),
    parseAssetData: (response, source) => parseConfigJsonFromResponse<IAssetData>(response, source),
    loadImageResource,
    loadVoltBundle: (buffer, textureDecoder) => VoltBundle.from(buffer, textureDecoder),
    loadHabBundle: (buffer, textureDecoder) => HabBundle.from(buffer, textureDecoder),
    bundleFormat: GetAssetBundleFormat
};

export class AssetManager implements IAssetManager
{
    private _textures: Map<string, Texture> = new Map();
    private _collections: Map<string, IGraphicAssetCollection> = new Map();
    private _assetIndex: Map<string, Set<GraphicAssetCollection>> = new Map();
    private _collectionOrder: WeakMap<GraphicAssetCollection, number> = new WeakMap();
    private _nextCollectionOrder: number = 0;
    private _imageResources: Map<string, LoadedImageResource> = new Map();
    private _inFlightDownloads: Map<string, Promise<boolean>> = new Map();

    public whenRoomAssetsReady(): Promise<void>
    {
        return Promise.resolve();
    }

    constructor(private readonly _dependencies: AssetManagerDependencies = DEFAULT_DEPENDENCIES)
    {
    }

    public getTexture(name: string): Texture
    {
        if(!name) return null;

        return this._textures.get(name);
    }

    public setTexture(name: string, texture: Texture): void
    {
        if(!name || !texture) return;

        texture.label = name;

        this._textures.set(name, texture);
    }

    public getAsset(name: string): IGraphicAsset
    {
        if(!name) return null;

        const candidates = this._assetIndex.get(name);
        if(!candidates) return null;

        let first: GraphicAssetCollection = null;
        let firstOrder = Infinity;
        for(const collection of candidates)
        {
            if(this._collections.get(collection.name) !== collection) continue;
            const order = this._collectionOrder.get(collection);
            if(order >= firstOrder) continue;
            first = collection;
            firstOrder = order;
        }
        return first?.getAsset(name) ?? null;
    }

    private assetChanged(collection: GraphicAssetCollection, name: string, added: boolean): void
    {
        let candidates = this._assetIndex.get(name);
        if(added)
        {
            if(!candidates) this._assetIndex.set(name, candidates = new Set());
            candidates.add(collection);
        }
        else if(candidates)
        {
            candidates.delete(collection);
            if(!candidates.size) this._assetIndex.delete(name);
        }
    }

    public addAssetToCollection(collectionName: string, assetName: string, texture: Texture, override: boolean = true): boolean
    {
        const collection = this.getCollection(collectionName);

        if(!collection) return false;

        return collection.addAsset(assetName, texture, override, 0, 0, false, false);
    }

    public getCollection(name: string): IGraphicAssetCollection
    {
        if(!name) return null;

        return this._collections.get(name) ?? null;
    }

    public createCollection(data: IAssetData, spritesheet: Spritesheet): IGraphicAssetCollection
    {
        if(!data) return null;

        const collection = new GraphicAssetCollection(data, spritesheet);

        for(const [name, texture] of collection.textures.entries()) this.setTexture(name, texture);

        const replaced = this._collections.get(collection.name) as GraphicAssetCollection;
        this._collectionOrder.set(collection, replaced ? this._collectionOrder.get(replaced) : this._nextCollectionOrder++);
        if(replaced)
        {
            replaced.onAssetChanged = null;
            for(const name of replaced.assetNames) this.assetChanged(replaced, name, false);
        }
        this._collections.set(collection.name, collection);
        for(const name of collection.assetNames) this.assetChanged(collection, name, true);
        collection.onAssetChanged = (name, added) => this.assetChanged(collection, name, added);

        return collection;
    }

    public async downloadAssets(urls: string[]): Promise<boolean>
    {
        if(!urls || !urls.length) return Promise.resolve(true);

        await Promise.all(urls.map(url => this.downloadAsset(url)));

        return true;
    }

    public async downloadAsset(url: string): Promise<boolean>
    {
        if(!url?.length) return false;

        const downloadKey = isAssetBundleUrl(url) ? GetAssetBundleUrl(url, this._dependencies.bundleFormat()) : url;
        const existing = this._inFlightDownloads.get(downloadKey);

        if(existing) return existing;

        const promise = this.performDownloadAsset(url).finally(() =>
        {
            if(this._inFlightDownloads.get(downloadKey) === promise) this._inFlightDownloads.delete(downloadKey);
        });

        this._inFlightDownloads.set(downloadKey, promise);

        return promise;
    }

    private async performDownloadAsset(url: string): Promise<boolean>
    {
        try
        {
            if(!url?.length) return false;

            if(url.startsWith('local://')) return this.downloadLocalAsset(url);

            if(isAssetBundleUrl(url))
            {
                // Only the configured format is fetched and read; the texture stays keyed by the requested URL.
                const format = this._dependencies.bundleFormat();
                const bundleUrl = GetAssetBundleUrl(url, format);
                const buffer = await this.fetchBundleBuffer(bundleUrl);
                const loadBundle = (format === 'hab') ? this._dependencies.loadHabBundle : this._dependencies.loadVoltBundle;
                const decodedResources: LoadedImageResource[] = [];

                try
                {
                    const bundle = await loadBundle(
                        buffer,
                        async (bytes, entryName) =>
                        {
                            const detected = detectImageFormat(new Uint8Array(bytes), undefined, entryName);

                            if(detected.format === 'svg')
                                throw new Error(`SVG texture entry "${ entryName }" is not supported inside a Volt bundle`);

                            const resource = await this._dependencies.loadImageResource({
                                source: entryName,
                                bytes,
                                allowAnimation: false
                            });

                            decodedResources.push(resource);

                            return pinPixelArtSampling(resource.texture);
                        });

                    await this.processAsset(bundle.texture, bundle.jsonFile);

                    const retainedResource = decodedResources.pop();

                    for(const resource of decodedResources) resource.dispose();
                    if(retainedResource) this.setImageResource(url, retainedResource);
                }
                catch (error)
                {
                    for(const resource of decodedResources) resource.dispose();
                    throw error;
                }
            }
            else if(isAssetJsonUrl(url))
            {
                const response = await this.fetchAsset(url);
                let data: IAssetData;

                try
                {
                    data = await this._dependencies.parseAssetData(response, url);
                }
                catch (error)
                {
                    throw new Error(`Invalid asset data "${ url }" - JSON/JSONC parse failed (${ errorMessage(error) })`);
                }

                const imagePath = data?.spritesheet?.meta?.image;
                const resolvedImageUrl = imagePath
                    ? new URL(imagePath, url).toString()
                    : assetImageFallbackUrl(url, data?.name);
                const resource = await this._dependencies.loadImageResource({
                    source: resolvedImageUrl,
                    allowAnimation: false
                });

                try
                {
                    await this.processAsset(pinPixelArtSampling(resource.texture), data);
                    this.setImageResource(url, resource);
                }
                catch (error)
                {
                    resource.dispose();
                    throw error;
                }
            }
            else
            {
                const resource = await this._dependencies.loadImageResource({ source: url });

                this.setImageResource(url, resource);
            }

            return true;
        }
        catch (error)
        {
            throw new Error(`Asset loading failed for "${ url }": ${ errorMessage(error) }`);
        }
    }

    private async downloadLocalAsset(url: string): Promise<boolean>
    {
        const key = url.substring('local://'.length);

        switch(key)
        {
            case 'room':
                await this.loadLocalRoom();
                return true;
            case 'place_holder':
            case 'place_holder_wall':
            case 'place_holder_pet':
            case 'tile_cursor':
            case 'selection_arrow':
            case 'avatar_additions':
            case 'floor_editor':
            case 'group_badge':
                await this.loadLocalAsset(key);
                return true;
            default:
                return false;
        }
    }

    private async fetchBundleBuffer(url: string): Promise<ArrayBuffer>
    {
        if(this._dependencies.fetch === DEFAULT_DEPENDENCIES.fetch)
        {
            const dataCache = (globalThis as {
                __voltPrefetchData?: Map<string, Promise<{ ok: boolean; status: number; buffer?: ArrayBuffer }>>;
            }).__voltPrefetchData;
            const prefetched = dataCache?.get(url);

            if(prefetched)
            {
                dataCache.delete(url);

                try
                {
                    const entry = await prefetched;

                    if(entry?.ok && entry.buffer) return entry.buffer;
                }
                catch {}
            }
        }

        const response = await this.fetchAsset(url);

        return response.arrayBuffer();
    }

    private async fetchAsset(url: string): Promise<Response>
    {
        let response: Response;

        try
        {
            const cache = (this._dependencies.fetch === DEFAULT_DEPENDENCIES.fetch)
                ? (globalThis as { __voltPrefetchCache?: Map<string, Promise<Response>> }).__voltPrefetchCache
                : undefined;
            const prefetched = cache?.get(url);

            if(prefetched) cache.delete(url);

            response = await (prefetched ?? this._dependencies.fetch(url));
        }
        catch (error)
        {
            throw new Error(`Could not fetch "${ url }" - is the URL correct and the server reachable? (${ errorMessage(error) })`);
        }

        if(!response?.ok) throw new Error(`Failed to load "${ url }" - server returned HTTP ${ response?.status ?? 'no response' }`);

        return response;
    }

    private setImageResource(key: string, resource: LoadedImageResource): void
    {
        const existing = this._imageResources.get(key);

        if(existing && existing !== resource) existing.dispose();

        this._imageResources.set(key, resource);
        this.setTexture(key, resource.texture);
    }

    private async loadLocalRoom(): Promise<void>
    {
        const roomData = roomAssetData as unknown as IAssetData;
        const collection = this.createCollection(roomData, null) as GraphicAssetCollection;
        if(!collection) return;

        const roomImages = import.meta.glob('./assets/room/*.{png,jpg,jpeg,gif,webp,avif,svg,bmp}', { eager: true });
        const roomImagesSub = import.meta.glob('./assets/room/images/*.{png,jpg,jpeg,gif,webp,avif,svg,bmp}', { eager: true });
        const merged = { ...roomImages, ...roomImagesSub };

        const loadEntry = async (path: string): Promise<void> =>
        {
            const mod = merged[path];
            const imageUrl = ((mod as { default?: string }).default ?? mod) as string;
            const rawName = imageNameFromPath(path);
            const resource = await this._dependencies.loadImageResource({ source: imageUrl, allowAnimation: false });
            const texture = resource.texture;

            if(!texture)
            {
                resource.dispose();
                return;
            }

            this.setImageResource(imageUrl, resource);
            this.setTexture(rawName, texture);
            collection.textures.set(rawName, texture);

            if(rawName.startsWith('room_'))
            {
                const normalizedName = rawName.substring('room_'.length);
                this.setTexture(normalizedName, texture);
                collection.textures.set(normalizedName, texture);
            }
        };

        await Promise.all(Object.keys(merged).map(loadEntry));

        collection.define(roomData);
    }

    private async loadLocalAsset(name: string): Promise<void>
    {
        let dataModule: { default?: IAssetData } | IAssetData;

        switch(name)
        {
            case 'place_holder':
                dataModule = placeHolderAssetData as unknown as IAssetData;
                break;
            case 'place_holder_wall':
                dataModule = placeHolderWallAssetData as unknown as IAssetData;
                break;
            case 'place_holder_pet':
                dataModule = placeHolderPetAssetData as unknown as IAssetData;
                break;
            case 'tile_cursor':
                dataModule = tileCursorAssetData as unknown as IAssetData;
                break;
            case 'selection_arrow':
                dataModule = selectionArrowAssetData as unknown as IAssetData;
                break;
            case 'avatar_additions':
                dataModule = avatarAdditionsAssetData as unknown as IAssetData;
                break;
            case 'floor_editor':
                dataModule = await import('./assets/floor_editor/floor_editor.asset.json');
                break;
            case 'group_badge':
                dataModule = await import('./assets/group_badge/group_badge.asset.json');
                break;
            default:
                return;
        }

        const data = ('default' in dataModule ? dataModule.default : dataModule) as IAssetData;
        const collection = this.createCollection(data, null) as GraphicAssetCollection;
        if(!collection) return;

        let images: Record<string, unknown>;

        if(name === 'group_badge')
        {
            images = (await import('./assets/group_badge/images')).images;
        }
        else if(name === 'floor_editor')
        {
            images = (await import('./assets/floor_editor/images')).images;
        }
        else
        {
            // Keep the ~19 KB of mandatory boot icons inline so RoomContentLoader avoids 18 late HTTP round-trips.
            const allImages = {
                ...import.meta.glob('./assets/place_holder/images/*.{png,jpg,jpeg,gif,webp,avif,svg,bmp}', { eager: true, query: '?inline' }),
                ...import.meta.glob('./assets/place_holder_wall/images/*.{png,jpg,jpeg,gif,webp,avif,svg,bmp}', { eager: true, query: '?inline' }),
                ...import.meta.glob('./assets/place_holder_pet/images/*.{png,jpg,jpeg,gif,webp,avif,svg,bmp}', { eager: true, query: '?inline' }),
                ...import.meta.glob('./assets/tile_cursor/images/*.{png,jpg,jpeg,gif,webp,avif,svg,bmp}', { eager: true, query: '?inline' }),
                ...import.meta.glob('./assets/selection_arrow/images/*.{png,jpg,jpeg,gif,webp,avif,svg,bmp}', { eager: true, query: '?inline' }),
                ...import.meta.glob('./assets/avatar_additions/images/*.{png,jpg,jpeg,gif,webp,avif,svg,bmp}', { eager: true, query: '?inline' })
            };
            const prefix = `./assets/${ name }/images/`;

            images = Object.fromEntries(Object.entries(allImages).filter(([path]) => path.startsWith(prefix)));
        }

        await Promise.all(Object.keys(images).map(async path =>
        {
            const mod = images[path];
            const imageUrl = ((mod as { default?: string }).default ?? mod) as string;
            const rawName = imageNameFromPath(path);
            const resource = await this._dependencies.loadImageResource({ source: imageUrl, allowAnimation: false });
            const texture = resource.texture;

            if(!texture)
            {
                resource.dispose();
                return;
            }

            this.setImageResource(imageUrl, resource);
            this.setTexture(rawName, texture);
            collection.textures.set(name + '_' + rawName, texture);
            collection.textures.set(rawName, texture);
        }));

        collection.define(data);
    }

    private async processAsset(texture: Texture, data: IAssetData): Promise<IGraphicAssetCollection>
    {
        let spritesheet: Spritesheet<SpritesheetData> = null;

        if(texture && data?.spritesheet && Object.keys(data.spritesheet).length)
        {
            spritesheet = new Spritesheet(texture, data.spritesheet);

            // Synchronous parse avoids PixiJS's 4ms-clamped setTimeout batching on large spritesheets during boot.
            spritesheet.parseSync();

            spritesheet.textureSource.label = data.name ?? null;
        }

        return this.createCollection(data, spritesheet);
    }

    public get collections(): Map<string, IGraphicAssetCollection>
    {
        return this._collections;
    }
}

const pinPixelArtSampling = (texture: Texture): Texture =>
{
    const source = texture?.source as (Texture['source'] & { voltFixedScaleMode?: boolean }) | undefined;

    if(!source) return texture;

    source.scaleMode = 'nearest';
    source.voltFixedScaleMode = true;

    return texture;
};

const imageNameFromPath = (path: string): string =>
{
    const fileName = path.split('/').pop() ?? path;

    return fileName.replace(/\.(?:png|jpe?g|gif|webp|avif|svg|bmp)$/i, '');
};

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error);
