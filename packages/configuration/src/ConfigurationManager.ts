import { VoltLogger, VoltVersion, parseConfigJson, parseConfigJsonFromResponse } from '@volt/utils';
import { IConfigurationManager } from './IConfigurationManager';

export class ConfigurationManager implements IConfigurationManager
{
    private _definitions: Map<string, unknown> = new Map();
    private _missingKeys: string[] = [];
    public static readonly GAMEDATA_VERSIONS_KEY = 'gamedata.versions';

    private _initialLoad: Promise<void> = null;
    private _preloadedDocuments: Map<string, string> = new Map();

    constructor()
    {
        VoltVersion.sayHello();
    }

    /** Loads the configuration once; later calls share that load. A failed load is retried on the next call. */
    public init(): Promise<void>
    {
        if(this._initialLoad === null)
        {
            this._initialLoad = this.reloadConfiguration().catch(error =>
            {
                this._initialLoad = null;

                throw error;
            });
        }

        return this._initialLoad;
    }

    /**
     * Supplies the text of a config.urls document the page already has (e.g. inlined into the entry
     * HTML), so the next load parses it instead of fetching. Used once; a later reload fetches again.
     */
    public preloadDocument(url: string, text: string): void
    {
        if(url && (typeof text === 'string')) this._preloadedDocuments.set(url, text);
    }

    public async reloadConfiguration(): Promise<void>
    {
        try
        {
            const defaultConfig = this.getDefaultConfig();

            if(!defaultConfig) throw new Error('Missing VoltConfig: make sure window.VoltConfig is defined in index.html');

            this.parseConfiguration(defaultConfig, true);

            const configurationUrls = this.getValue<string[]>('config.urls').slice();

            if(!configurationUrls || !configurationUrls.length) throw new Error('No config.urls defined in VoltConfig — expected an array like ["/renderer-config.json", "/ui-config.json"]');

            const firstEmptyUrl = configurationUrls.findIndex(url => !url || !url.length);
            const urls = (firstEmptyUrl >= 0) ? configurationUrls.slice(0, firstEmptyUrl) : configurationUrls;

            // Fetched together; later documents still override earlier ones below.
            const documents: any[] = await Promise.all(urls.map(async url =>
            {
                const preloaded = this._preloadedDocuments.get(url);

                if(preloaded !== undefined)
                {
                    this._preloadedDocuments.delete(url);

                    try
                    {
                        return parseConfigJson(preloaded, url);
                    }
                    catch (parseError)
                    {
                        throw new Error(`Invalid config "${ url }" — JSON/JSONC parse failed. JSONC allows comments and trailing commas (${ parseError.message })`);
                    }
                }

                let response: Response;

                try
                {
                    response = await fetch(url);
                }
                catch (fetchError)
                {
                    throw new Error(`Failed to fetch config "${ url }" — check that the file exists and the server is reachable (${ fetchError.message })`);
                }

                if(response.status !== 200) throw new Error(`Failed to load config "${ url }" — server returned HTTP ${ response.status }`);

                let json: any;

                try
                {
                    json = await parseConfigJsonFromResponse(response, url);
                }
                catch (parseError)
                {
                    throw new Error(`Invalid config "${ url }" — JSON/JSONC parse failed. JSONC allows comments and trailing commas (${ parseError.message })`);
                }

                return json;
            }));

            this.resetConfiguration();
            this.parseConfiguration(defaultConfig, true);

            for(const json of documents) this.parseConfiguration(json);
        }

        catch (err)
        {
            throw new Error(err.message || String(err));
        }
    }

    public resetConfiguration(): void
    {
        this._definitions.clear();
        this._missingKeys = [];
    }

    public parseConfiguration(data: { [index: string]: any }, overrides: boolean = false): boolean
    {
        if(!data) return false;

        try
        {
            const regex = new RegExp(/\${(.*?)}/g);

            for(const key in data)
            {
                let value = data[key];

                if(typeof value === 'string') value = this.interpolate(value, regex);

                if(this._definitions.has(key))
                {
                    if(overrides) this.setValue(key, value);
                }
                else
                {
                    this.setValue(key, value);
                }
            }

            return true;
        }

        catch (e)
        {
            VoltLogger.error(e.stack);

            return false;
        }
    }

    public interpolate(value: string, regex: RegExp = null): string
    {
        if(!regex) regex = new RegExp(/\${(.*?)}/g);

        const pieces = value.match(regex);

        if(pieces && pieces.length)
        {
            for(const piece of pieces)
            {
                const existing = (this._definitions.get(this.removeInterpolateKey(piece)) as string);

                if(existing) (value = value.replace(piece, existing));
            }
        }

        if(value.indexOf('%timestamp%') >= 0)
        {
            value = this.versionCacheBuster(value).replace(/%timestamp%/gi, Date.now().toString());
        }

        return value;
    }

    /**
     * A gamedata URL whose file has a known version (gamedata.versions, file name -> version, which the client
     * gets from its entry page) asks for that version (?v=) instead of a new timestamp, so browsers and the
     * edge can cache it until the file changes.
     */
    private versionCacheBuster(value: string): string
    {
        const versions = this._definitions.get(ConfigurationManager.GAMEDATA_VERSIONS_KEY) as Record<string, unknown>;

        if(!versions || (typeof versions !== 'object')) return value;

        const file = value.split(/[?#]/, 1)[0].split('/').pop();
        const version = file ? versions[file] : null;

        return (typeof version === 'string' && version.length) ? value.replace(/([?&])t=%timestamp%/i, `$1v=${ encodeURIComponent(version) }`) : value;
    }

    private removeInterpolateKey(value: string): string
    {
        return value.replace('${', '').replace('}', '');
    }

    public getValue<T>(key: string, value: T = null): T
    {
        let existing = this._definitions.get(key);

        if(existing === undefined)
        {
            if(this._missingKeys.indexOf(key) >= 0) return value;

            this._missingKeys.push(key);

            VoltLogger.warn(`Missing configuration key: ${key}`);

            existing = value;
        }

        return (existing as T);
    }

    // Keys stay flat: Habbo sets both a key and deeper keys under it, e.g. currencyiconstyle.big.101 and currencyiconstyle.big.101.combo.
    public setValue<T>(key: string, value: T): void
    {
        this._definitions.set(key, value);
    }

    public getDefaultConfig(): { [index: string]: any }
    {
        return window.VoltConfig;
    }

    public get definitions(): Map<string, unknown>
    {
        return this._definitions;
    }
}
