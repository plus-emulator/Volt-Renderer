import { GetAssetManager } from '@volt/assets';
import { GetCommunication, GroupBadgePartsEvent } from '@volt/communication';
import { GetConfiguration } from '@volt/configuration';
import { BadgeImageReadyEvent, GetEventDispatcher } from '@volt/events';
import { VoltLogger, TextureUtils } from '@volt/utils';
import { Container, Sprite, Texture } from 'pixi.js';
import { BadgeInfo } from './BadgeInfo';
import { GroupBadge } from './GroupBadge';
import { GroupBadgePart } from './GroupBadgePart';

export class BadgeImageManager
{
    public static GROUP_BADGE: string = 'group_badge';
    public static NORMAL_BADGE: string = 'normal_badge';

    private _groupBases: Map<number, string[]> = new Map();
    private _groupSymbols: Map<number, string[]> = new Map();
    private _groupPartColors: Map<number, string> = new Map();
    private _tintedPartTextures: Map<string, Texture> = new Map();
    private static MAX_GROUP_BADGE_ATTEMPTS: number = 20;

    private _requestedBadges: Map<string, boolean> = new Map();
    private _groupBadgesQueue: Map<string, number> = new Map();
    private _readyToGenerateGroupBadges: boolean = false;
    private _groupBadgeAssetsLoaded: boolean = false;
    private _groupBadgeAssetsLoading: Promise<boolean> | null = null;
    private _groupBadgeRetryTimeout: ReturnType<typeof setTimeout> = null;

    public async init(): Promise<void>
    {
        GetCommunication().registerMessageEvent(new GroupBadgePartsEvent(this.onGroupBadgePartsEvent.bind(this)));
    }

    public getBadgeImage(badgeName: string, type: string = BadgeImageManager.NORMAL_BADGE, load: boolean = true): Texture
    {
        return this.getBadgeTexture(badgeName, type);
    }

    public getBadgeInfo(badgeName: string): BadgeInfo
    {
        const badge = this.getBadgeTexture(badgeName);

        return (badge) ? new BadgeInfo(badge, false) : new BadgeInfo(this.getBadgePlaceholder(), true);
    }

    public loadBadgeImage(badgeName: string, type: string = BadgeImageManager.NORMAL_BADGE): string
    {
        if(GetAssetManager().getTexture(this.getBadgeUrl(badgeName, type))) return badgeName;

        this.getBadgeTexture(badgeName, type);

        return null;
    }

    private getBadgeTexture(badgeName: string, type: string = BadgeImageManager.NORMAL_BADGE): Texture
    {
        const url = this.getBadgeUrl(badgeName, type);

        if(!url || !url.length) return null;

        const texture = GetAssetManager().getTexture(url);

        if(texture) return texture;

        if(type === BadgeImageManager.NORMAL_BADGE)
        {
            const loadBadge = async () =>
            {
                try
                {
                    if(!await GetAssetManager().downloadAsset(url)) return;

                    const loadedTexture = GetAssetManager().getTexture(url);

                    if(loadedTexture) GetEventDispatcher().dispatchEvent(new BadgeImageReadyEvent(badgeName, loadedTexture));
                }

                catch (err)
                {
                    VoltLogger.error(err);
                }
            };

            void loadBadge();
        }

        else if(type === BadgeImageManager.GROUP_BADGE)
        {
            if(!this._groupBadgesQueue.has(badgeName)) this._groupBadgesQueue.set(badgeName, 0);
            void this.processGroupBadgeQueue();
        }

        return this.getBadgePlaceholder();
    }

    private getBadgePlaceholder(): Texture
    {
        return GetAssetManager().getTexture(GetConfiguration().getValue<string>('images.url') + '/loading_icon.png');
    }

    public getBadgeUrl(badge: string, type: string = BadgeImageManager.NORMAL_BADGE): string
    {
        let url = null;

        switch(type)
        {
            case BadgeImageManager.NORMAL_BADGE:
                url = (GetConfiguration().getValue<string>('badge.asset.url')).replace('%badgename%', badge);
                break;
            case BadgeImageManager.GROUP_BADGE:
                url = badge;
                break;
        }

        return url;
    }

    private scheduleQueueRetry(): void
    {
        if(this._groupBadgeRetryTimeout) return;

        this._groupBadgeRetryTimeout = setTimeout(() =>
        {
            this._groupBadgeRetryTimeout = null;
            void this.processGroupBadgeQueue();
        }, 250);
    }

    private async ensureGroupBadgeAssetsLoaded(): Promise<boolean>
    {
        if(this._groupBadgeAssetsLoaded) return true;

        if(this._groupBadgeAssetsLoading === null)
        {
            this._groupBadgeAssetsLoading = GetAssetManager().downloadAsset('local://group_badge')
                .then(result =>
                {
                    this._groupBadgeAssetsLoaded = result;

                    return result;
                })
                .catch(err =>
                {
                    VoltLogger.error(err);

                    return false;
                })
                .finally(() => this._groupBadgeAssetsLoading = null);
        }

        return this._groupBadgeAssetsLoading;
    }

    private async processGroupBadgeQueue(): Promise<void>
    {
        if(!this._readyToGenerateGroupBadges || !this._groupBadgesQueue.size) return;

        if(!await this.ensureGroupBadgeAssetsLoaded())
        {
            this.scheduleQueueRetry();
            return;
        }

        let hasPending = false;

        for(const badgeCode of Array.from(this._groupBadgesQueue.keys()))
        {
            if(this.loadGroupBadge(badgeCode)) continue;

            const attempts = ((this._groupBadgesQueue.get(badgeCode) ?? 0) + 1);

            if(attempts >= BadgeImageManager.MAX_GROUP_BADGE_ATTEMPTS)
            {
                this._groupBadgesQueue.delete(badgeCode);
                this._requestedBadges.delete(badgeCode);

                VoltLogger.warn(`Group badge could not be rendered, giving up: ${badgeCode}`);
            }
            else
            {
                this._groupBadgesQueue.set(badgeCode, attempts);

                hasPending = true;
            }
        }

        if(hasPending) this.scheduleQueueRetry();
    }

    private loadGroupBadge(badgeCode: string): boolean
    {
        const groupBadge = new GroupBadge(badgeCode);
        const partMatches = [...badgeCode.matchAll(/[bst][0-9]{4,6}/g)];

        for(const partMatch of partMatches)
        {
            const partCode = partMatch[0];
            const shortMethod = (partCode.length === 6);
            const partType = partCode[0];
            const parsedPartId = parseInt(partCode.slice(1, shortMethod ? 3 : 4));
            const partId = ((partType === GroupBadgePart.SYMBOL_ALT) ? (parsedPartId + 100) : parsedPartId);
            const partColor = parseInt(partCode.slice(shortMethod ? 3 : 4, shortMethod ? 5 : 6));
            const partPosition = partCode.length < 6 ? 0 : parseInt(partCode.slice(shortMethod ? 5 : 6, shortMethod ? 6 : 7)); // sometimes position is ommitted
            const part = new GroupBadgePart(partType, partId, partColor, partPosition);

            groupBadge.parts.push(part);
        }

        if(!this.renderGroupBadge(groupBadge)) return false;

        this._requestedBadges.delete(groupBadge.code);
        this._groupBadgesQueue.delete(groupBadge.code);

        return true;
    }

    private renderGroupBadge(groupBadge: GroupBadge): boolean
    {
        const container = new Container();
        const tempSprite = new Sprite(Texture.EMPTY);
        let renderedLayers = 0;

        const abort = (): boolean =>
        {
            container.destroy({ children: true });

            return false;
        };

        tempSprite.width = GroupBadgePart.IMAGE_WIDTH;
        tempSprite.height = GroupBadgePart.IMAGE_HEIGHT;

        container.addChild(tempSprite);

        for(const part of groupBadge.parts)
        {
            let isFirst = true;
            let renderedPartLayers = 0;

            const partNames = ((part.type === 'b') ? this._groupBases.get(part.key) : this._groupSymbols.get(part.key));

            if(!partNames || !partNames.length) return abort();

            for(const partName of partNames)
            {
                if(!partName || !partName.length) continue;

                const texture = this.getBadgePartTexture(part.type, partName);

                if(!texture) continue;

                const { x, y } = part.calculatePosition(texture);
                const sprite = new Sprite(texture);

                if(isFirst) this.tintPart(sprite, part.color);

                sprite.position.set(x, y);

                isFirst = false;
                renderedLayers++;
                renderedPartLayers++;

                container.addChild(sprite);
            }

            if(!renderedPartLayers) return abort();
        }

        if(!renderedLayers) return abort();

        const texture = TextureUtils.generateTexture(container);
        container.destroy({ children: true });
        GetAssetManager().setTexture(groupBadge.code, texture);

        GetEventDispatcher().dispatchEvent(new BadgeImageReadyEvent(groupBadge.code, texture));

        return true;
    }

    private getBadgePartTexture(partType: string, rawPartName: string): Texture
    {
        const partName = rawPartName.replace('.png', '').replace('.gif', '');
        const withoutLayerSuffix = partName.replace(/_part[12]$/i, '');
        const candidates = new Set<string>();

        candidates.add(partName);
        candidates.add(withoutLayerSuffix);
        candidates.add(`badgepart_${partName}`);
        candidates.add(`badgepart_${withoutLayerSuffix}`);

        if(!partName.startsWith('badgepart_'))
        {
            if((partType === 's') || (partType === 't')) candidates.add(`badgepart_symbol_${partName}`);
            if((partType === 's') || (partType === 't')) candidates.add(`badgepart_symbol_${withoutLayerSuffix}`);
            if(partType === 'b') candidates.add(`badgepart_base_${partName}`);
            if(partType === 'b') candidates.add(`badgepart_base_${withoutLayerSuffix}`);
        }

        for(const candidate of candidates)
        {
            const texture = GetAssetManager().getTexture(candidate);

            if(texture) return texture;
        }

        return null;
    }


    private getPartTintColor(colorId: number): number | null
    {
        let colorHex = (this._groupPartColors.get(colorId) || this._groupPartColors.get(1) || 'FFFFFF');

        if(!colorHex || !colorHex.length) return null;

        if(colorHex.startsWith('#')) colorHex = colorHex.substring(1);

        const tintColor = parseInt(colorHex, 16);

        return Number.isFinite(tintColor) ? tintColor : null;
    }

    // Habbo's badge imager multiplies each channel as (value * color) >> 8, so full white becomes color - 1.
    private tintPart(sprite: Sprite, colorId: number): void
    {
        const tintColor = this.getPartTintColor(colorId);

        if(tintColor === null) return;

        const texture = sprite.texture;

        const key = `${ texture.uid }:${ tintColor }`;
        const existing = this._tintedPartTextures.get(key);

        if(existing && !existing.destroyed)
        {
            sprite.texture = existing;

            return;
        }

        const resource = texture.source?.resource as CanvasImageSource;

        // Keep the sprite tint when the source pixels cannot be read.
        sprite.tint = tintColor;

        if(!resource || (typeof document === 'undefined')) return;

        const frame = texture.frame;
        const width = Math.max(1, Math.round(frame.width));
        const height = Math.max(1, Math.round(frame.height));
        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d', { willReadFrequently: true });

        let imageData: ImageData = null;

        try
        {
            context.drawImage(resource, frame.x, frame.y, width, height, 0, 0, width, height);

            imageData = context.getImageData(0, 0, width, height);
        }
        catch
        {
            return;
        }

        const pixels = imageData.data;
        const red = ((tintColor >> 16) & 0xFF);
        const green = ((tintColor >> 8) & 0xFF);
        const blue = (tintColor & 0xFF);

        for(let index = 0; index < pixels.length; index += 4)
        {
            pixels[index] = ((pixels[index] * red) >> 8);
            pixels[index + 1] = ((pixels[index + 1] * green) >> 8);
            pixels[index + 2] = ((pixels[index + 2] * blue) >> 8);
        }

        context.putImageData(imageData, 0, 0);

        const result = Texture.from(canvas, true);

        this._tintedPartTextures.set(key, result);

        sprite.texture = result;
        sprite.tint = 0xFFFFFF;
    }

    private onGroupBadgePartsEvent(event: GroupBadgePartsEvent): void
    {
        if(!event) return;

        const data = event.getParser();

        if(!data) return;

        data.bases.forEach((names, id) => this._groupBases.set(data.baseCodeIds.get(id) ?? id, names.map(val => val.replace('.png', '').replace('.gif', ''))));

        data.symbols.forEach((names, id) => this._groupSymbols.set(data.symbolCodeIds.get(id) ?? id, names.map(val => val.replace('.png', '').replace('.gif', ''))));

        this._groupPartColors = data.partColors;
        this._readyToGenerateGroupBadges = true;

        void this.processGroupBadgeQueue();
    }
}
