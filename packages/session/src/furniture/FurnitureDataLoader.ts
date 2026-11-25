import { FurnitureType, IFurnitureData } from '@volt/api';
import { GetLocalizationManager } from '@volt/localization';
import { loadGamedata } from '@volt/utils';
import { FurnitureData } from './FurnitureData';
import { GetFurnitureDataUrl } from './FurnitureDataUrl';

export class FurnitureDataLoader
{
    private _floorItems: Map<number, IFurnitureData>;
    private _wallItems: Map<number, IFurnitureData>;

    constructor(floorItems: Map<number, IFurnitureData>, wallItems: Map<number, IFurnitureData>)
    {
        this._floorItems = floorItems;
        this._wallItems = wallItems;
    }

    /** Loads the furnidata; the boot load asks for the version the client was started with. */
    public async init(versioned: boolean = false, localizationReady?: Promise<void>, lazyLocalization: boolean = false): Promise<void>
    {
        const url = GetFurnitureDataUrl(versioned);

        if(!url || !url.length) throw new Error('Missing "furnidata.url" in config — add the furniture data URL to your renderer-config.json');

        let responseData: any;

        try
        {
            if(lazyLocalization || !localizationReady)
            {
                responseData = await loadGamedata(url);
            }
            else
            {
                // Fetch immediately, but apply furniture text overrides after base localization.
                [responseData] = await Promise.all([loadGamedata(url), localizationReady]);
            }
        }
        catch (err)
        {
            throw new Error(`Could not load furniture data from "${ url }" — check "furnidata.url" in renderer-config.json (${ err?.message || err })`);
        }

        if(responseData.roomitemtypes) this.parseFloorItems(responseData.roomitemtypes, !lazyLocalization, false);

        if(responseData.wallitemtypes) this.parseWallItems(responseData.wallitemtypes, !lazyLocalization, false);
    }

    // Reload a furniture-data chunk such as custom/imported.jsonc and merge it
    // into the existing maps. Returned entries let RoomContentLoader update
    // without a full client reload.
    public async mergeFromUrl(url: string, updateLocalization: boolean = true): Promise<IFurnitureData[]>
    {
        if(!url || !url.length) return [];

        let responseData: any;

        try
        {
            responseData = await loadGamedata(url);
        }
        catch (err)
        {
            return [];
        }

        const added: IFurnitureData[] = [];

        if(responseData.roomitemtypes) added.push(...this.parseFloorItems(responseData.roomitemtypes, updateLocalization, true));

        if(responseData.wallitemtypes) added.push(...this.parseWallItems(responseData.wallitemtypes, updateLocalization, true));

        return added;
    }

    private parseFloorItems(data: any, updateLocalization: boolean = true, collectAdded: boolean = true): IFurnitureData[]
    {
        const added: IFurnitureData[] = [];

        if(!data || !data.furnitype) return added;

        for(const furniture of data.furnitype)
        {
            if(!furniture) continue;

            const colors: number[] = [];

            if(furniture.partcolors)
            {
                for(const color of furniture.partcolors.color)
                {
                    let colorCode = (color as string);

                    if(colorCode.charCodeAt(0) === 35) colorCode = colorCode.slice(1);

                    colors.push(parseInt(colorCode, 16));
                }
            }

            const rawClassName = furniture.classname as string;
            const starIndex = rawClassName.indexOf('*');
            const className = starIndex >= 0 ? rawClassName.slice(0, starIndex) : rawClassName;
            const hasColorIndex = starIndex >= 0;
            const colorIndex = hasColorIndex ? parseInt(rawClassName.slice(starIndex + 1)) : 0;
            const allowStack = this.resolveBooleanFlag(furniture.allowstack, furniture.allow_stack, furniture.allowStack);

            const furnitureData = new FurnitureData(FurnitureType.FLOOR, furniture.id, rawClassName, className, furniture.category, furniture.name, furniture.description, furniture.revision, furniture.xdim, furniture.ydim, 0, colors, hasColorIndex, colorIndex, furniture.adurl, furniture.offerid, furniture.buyout, furniture.rentofferid, furniture.rentbuyout, furniture.customparams, furniture.specialtype, allowStack, furniture.canstandon, furniture.cansiton, furniture.canlayon, furniture.excludeddynamic, furniture.furniline, furniture.environment, furniture.rare,
                furniture.canputstuffon == null ? undefined : this.resolveBooleanFlag(furniture.canputstuffon),
                furniture.height == null || !Number.isFinite(Number(furniture.height)) ? undefined : Number(furniture.height),
                furniture.tradeable == null ? undefined : this.resolveBooleanFlag(furniture.tradeable),
                this.resolveBooleanFlag(furniture.bc), this.resolveOfferId(furniture.bcofferid));

            this._floorItems.set(furnitureData.id, furnitureData);

            if(collectAdded) added.push(furnitureData);

            if(updateLocalization) this.updateLocalizations(furnitureData);
        }

        return added;
    }

    private parseWallItems(data: any, updateLocalization: boolean = true, collectAdded: boolean = true): IFurnitureData[]
    {
        const added: IFurnitureData[] = [];

        if(!data || !data.furnitype) return added;

        for(const furniture of data.furnitype)
        {
            if(!furniture) continue;

            const allowStack = this.resolveBooleanFlag(furniture.allowstack, furniture.allow_stack, furniture.allowStack);
            const furnitureData = new FurnitureData(FurnitureType.WALL, furniture.id, furniture.classname, furniture.classname, furniture.category, furniture.name, furniture.description, furniture.revision, 0, 0, 0, null, false, 0, furniture.adurl, furniture.offerid, furniture.buyout, furniture.rentofferid, furniture.rentbuyout, null, furniture.specialtype, allowStack, false, false, false, furniture.excludeddynamic, furniture.furniline, furniture.environment, furniture.rare,
                furniture.canputstuffon == null ? undefined : this.resolveBooleanFlag(furniture.canputstuffon),
                furniture.height == null || !Number.isFinite(Number(furniture.height)) ? undefined : Number(furniture.height),
                furniture.tradeable == null ? undefined : this.resolveBooleanFlag(furniture.tradeable),
                this.resolveBooleanFlag(furniture.bc), this.resolveOfferId(furniture.bcofferid));

            this._wallItems.set(furnitureData.id, furnitureData);

            if(collectAdded) added.push(furnitureData);

            if(updateLocalization) this.updateLocalizations(furnitureData);
        }

        return added;
    }

    private updateLocalizations(furniture: FurnitureData): void
    {
        switch(furniture.type)
        {
            case FurnitureType.FLOOR:
                GetLocalizationManager().setValue(('roomItem.name.' + furniture.id), furniture.name);
                GetLocalizationManager().setValue(('roomItem.desc.' + furniture.id), furniture.description);
                return;
            case FurnitureType.WALL:
                GetLocalizationManager().setValue(('wallItem.name.' + furniture.id), furniture.name);
                GetLocalizationManager().setValue(('wallItem.desc.' + furniture.id), furniture.description);
                return;
        }
    }

    private resolveBooleanFlag(a?: any, b?: any, c?: any): boolean
    {
        const first = a !== undefined && a !== null ? a : (b !== undefined && b !== null ? b : c);

        if(first === undefined || first === null) return false;
        if(typeof first === 'boolean') return first;
        if(typeof first === 'number') return first !== 0;

        if(typeof first === 'string')
        {
            const normalized = first.trim().toLowerCase();

            if(normalized === '1' || normalized === 'true' || normalized === 'yes') return true;
            if(normalized === '0' || normalized === 'false' || normalized === 'no') return false;
            if(!normalized.length) return this.resolveBooleanFlag(b !== first ? b : undefined, c !== first ? c : undefined);
        }

        return !!first;
    }

    // AIR FurnitureDataParser reads bcofferid as an int; a missing one is -1.
    private resolveOfferId(value: any): number
    {
        const offerId = parseInt(value);

        return Number.isFinite(offerId) ? offerId : -1;
    }
}
