import { AlphaTolerance, IRoomObjectSprite, RoomObjectSpriteType } from '@volt/api';
import { GetRenderer } from '@volt/utils';
import { ColorMatrixFilter, Container, Filter, RenderTexture, Sprite, Texture } from 'pixi.js';
import { RoomObjectSprite } from './RoomObjectSprite';

// Room for the widest glow (neon aura, 24 px) around the silhouette.
const PADDING = 32;
const DEPTH_OFFSET = 0.0005;
const TEXTURE_STEP = 32;

interface SourceState
{
    sprite: IRoomObjectSprite;
    texture: Texture;
    offsetX: number;
    offsetY: number;
    flipH: boolean;
    flipV: boolean;
    scale: number;
}

let silhouetteFilter: ColorMatrixFilter = null;

// Every drawn pixel becomes opaque black, like AIR's threshold pass.
const createSilhouetteContainer = (): Container =>
{
    if(!silhouetteFilter)
    {
        silhouetteFilter = new ColorMatrixFilter();
        silhouetteFilter.matrix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0];
    }

    return new Container({ filters: [ silhouetteFilter ] });
};

// Outline, soft glow and neon aura: one extra sprite behind the object shows the glow of the
// object's whole silhouette, and the object's own sprites keep their look.
// AIR: room/object/visualization/furniture/class_2714.as (WIN63-202610201032-107964540).
export class WiredHighlightSilhouette
{
    private _sprite: RoomObjectSprite = new RoomObjectSprite();
    private _silhouette: RenderTexture = null;
    private _texture: RenderTexture = null;
    private _sources: SourceState[] = [];
    private _filters: Filter[] = null;
    private _offsetX: number = 0;
    private _offsetY: number = 0;

    private _container: Container = null;
    private _glowSprite: Sprite = null;

    public get sprite(): IRoomObjectSprite
    {
        return this._sprite;
    }

    public update(sources: IRoomObjectSprite[], filters: Filter[], alpha: number, type: string, direction: number, forceRebuild: boolean): void
    {
        this.applySpriteDefaults(type, direction);

        if(!filters || !filters.length)
        {
            this.clear(false);

            return;
        }

        if(!sources.length || (alpha <= 0))
        {
            this._sprite.visible = false;
            this._sprite.alpha = 0;

            return;
        }

        const rebuild = (forceRebuild || this.sourcesChanged(sources));

        if(rebuild && !this.rebuildSilhouette(sources))
        {
            this.clear(true);

            return;
        }

        if(rebuild || (filters !== this._filters))
        {
            this.renderFilters(filters);
            this._filters = filters;
        }

        this._sprite.texture = this._texture;
        this._sprite.offsetX = this._offsetX;
        this._sprite.offsetY = this._offsetY;
        this._sprite.relativeDepth = this.getDepth(sources);
        this._sprite.alpha = alpha;
        this._sprite.visible = true;
    }

    public clear(disposeTextures: boolean): void
    {
        this._sprite.visible = false;
        this._sprite.alpha = 0;
        this._sprite.texture = null;
        this._filters = null;

        if(!disposeTextures) return;

        this.destroyTextures();
        this._sources = [];
    }

    public dispose(): void
    {
        this.clear(true);

        this._container?.destroy({ children: true });
        this._container = null;

        this._glowSprite?.destroy();
        this._glowSprite = null;

        this._sprite.dispose();
    }

    private applySpriteDefaults(type: string, direction: number): void
    {
        const sprite = this._sprite;

        sprite.type = type;
        sprite.libraryAssetName = '';
        sprite.posture = null;
        sprite.tag = 'wired_highlight';
        sprite.color = 0xFFFFFF;
        sprite.blendMode = 'normal';
        sprite.filters = null;
        sprite.flipH = false;
        sprite.flipV = false;
        sprite.scale = 1;
        sprite.direction = direction;
        sprite.alphaTolerance = AlphaTolerance.MATCH_NOTHING;
        sprite.clickHandling = false;
        sprite.skipMouseHandling = true;
        sprite.spriteType = RoomObjectSpriteType.DEFAULT;
        sprite.varyingDepth = false;
    }

    private sourcesChanged(sources: IRoomObjectSprite[]): boolean
    {
        if(this._sources.length !== sources.length) return true;

        return sources.some((sprite, index) =>
        {
            const state = this._sources[index];

            return (state.sprite !== sprite) || (state.texture !== sprite.texture) || (state.offsetX !== sprite.offsetX) || (state.offsetY !== sprite.offsetY)
                || (state.flipH !== sprite.flipH) || (state.flipV !== sprite.flipV) || (state.scale !== sprite.scale);
        });
    }

    private rebuildSilhouette(sources: IRoomObjectSprite[]): boolean
    {
        const renderer = GetRenderer();

        if(!renderer) return false;

        if(!this._container) this._container = createSilhouetteContainer();

        const container = this._container;

        while(container.children.length < sources.length) container.addChild(new Sprite());

        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        // A flipped room sprite is drawn mirrored to the left of (or above) its offset.
        sources.forEach((source, index) =>
        {
            const scale = ((source.scale > 0) ? source.scale : 1);
            const width = (source.texture.width * scale);
            const height = (source.texture.height * scale);
            const x = (source.flipH ? (source.offsetX - width) : source.offsetX);
            const y = (source.flipV ? (source.offsetY - height) : source.offsetY);

            left = Math.min(left, x);
            top = Math.min(top, y);
            right = Math.max(right, (x + width));
            bottom = Math.max(bottom, (y + height));

            const child = container.children[index] as Sprite;

            child.texture = source.texture;
            child.visible = true;
            child.scale.set((source.flipH ? -scale : scale), (source.flipV ? -scale : scale));
            child.position.set(source.offsetX, source.offsetY);
        });

        for(let index = sources.length; index < container.children.length; index++) container.children[index].visible = false;

        left = Math.floor(left);
        top = Math.floor(top);

        const width = (Math.ceil(right - left) + (PADDING * 2));
        const height = (Math.ceil(bottom - top) + (PADDING * 2));

        this.ensureTextureSize(width, height);

        container.position.set((PADDING - left), (PADDING - top));

        renderer.render({ container, target: this._silhouette, clear: true });

        for(const child of container.children) (child as Sprite).texture = Texture.EMPTY;

        this._offsetX = (left - PADDING);
        this._offsetY = (top - PADDING);
        this._sources = sources.map(sprite => ({ sprite, texture: sprite.texture, offsetX: sprite.offsetX, offsetY: sprite.offsetY, flipH: sprite.flipH, flipV: sprite.flipV, scale: sprite.scale }));

        return true;
    }

    // The textures only grow, in steps, so a walking or animating avatar reuses them.
    private ensureTextureSize(width: number, height: number): void
    {
        if(this._silhouette && (this._silhouette.width >= width) && (this._silhouette.height >= height)) return;

        width = (Math.ceil(Math.max(width, (this._silhouette?.width ?? 0)) / TEXTURE_STEP) * TEXTURE_STEP);
        height = (Math.ceil(Math.max(height, (this._silhouette?.height ?? 0)) / TEXTURE_STEP) * TEXTURE_STEP);

        this._sprite.texture = null;
        this.destroyTextures();

        this._silhouette = RenderTexture.create({ width, height, scaleMode: 'nearest' });
        this._texture = RenderTexture.create({ width, height, scaleMode: 'nearest' });
    }

    // Each filter draws the glow of the plain silhouette, and the glows are stacked (not chained).
    private renderFilters(filters: Filter[]): void
    {
        const renderer = GetRenderer();

        if(!renderer || !this._silhouette) return;

        if(!this._glowSprite) this._glowSprite = new Sprite();

        const sprite = this._glowSprite;

        sprite.texture = this._silhouette;

        filters.forEach((filter, index) =>
        {
            sprite.filters = [ filter ];

            renderer.render({ container: sprite, target: this._texture, clear: (index === 0) });
        });

        sprite.filters = null;
        sprite.texture = Texture.EMPTY;

        this._sprite.increaseUpdateCounter();
    }

    // Just behind the farthest source.
    private getDepth(sources: IRoomObjectSprite[]): number
    {
        return (Math.max(...sources.map(sprite => sprite.relativeDepth)) + DEPTH_OFFSET);
    }

    private destroyTextures(): void
    {
        this._silhouette?.destroy(true);
        this._texture?.destroy(true);
        this._silhouette = null;
        this._texture = null;
    }
}
