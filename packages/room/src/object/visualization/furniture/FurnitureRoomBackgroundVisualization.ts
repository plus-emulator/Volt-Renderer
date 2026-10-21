import { Texture } from 'pixi.js';
import { DirectionalOffsetData } from '../data';
import { CreateHalfSizeTexture } from '../HalfSizeTexture';
import { FurnitureBrandedImageVisualization } from './FurnitureBrandedImageVisualization';

export class FurnitureRoomBackgroundVisualization extends FurnitureBrandedImageVisualization
{
    // Sort depth of the image: larger is further back. Room planes sit near 2000 (RoomVisualization
    // ROOM_DEPTH_OFFSET) and furniture, pets and avatars sort below ~150 even in big rooms, so this
    // band lies between them whatever the tile of the furni. offsetZ moves the image inside the band.
    private static readonly BACKGROUND_LAYER_DEPTH: number = 1000;
    private static readonly BACKGROUND_LAYER_DEPTH_RANGE: number = 500;

    private _imageOffsets: Map<number, DirectionalOffsetData> = null;
    private _halfSizeImage: Texture = null;
    private _halfSizeImageUrl: string = null;

    protected imageReady(texture: Texture, imageUrl: string): void
    {
        super.imageReady(texture, imageUrl);

        if(!texture) return;

        // AIR FurnitureRoomBackgroundVisualization: offsets for the full image and for its size 32 half.
        this._imageOffsets = new Map([ [ 1, this.createImageOffset(texture.width, texture.height) ], [ 0.5, this.createImageOffset((texture.width / 2), (texture.height / 2)) ] ]);
    }

    private createImageOffset(width: number, height: number): DirectionalOffsetData
    {
        const offsetData = new DirectionalOffsetData();

        offsetData.setDirection(1, 0, -height);
        offsetData.setDirection(3, 0, 0);
        offsetData.setDirection(5, -width, 0);
        offsetData.setDirection(7, -width, -height);
        offsetData.setDirection(4, (-width / 2), (-height / 2));

        return offsetData;
    }

    /** AIR FurnitureRoomBrandingVisualization: a size 32 visualization draws the image at half size unless its url says noscale. */
    private getImageFactor(scale: number): number
    {
        const imageUrl = (this._imageUrl ?? '');

        if(imageUrl.indexOf('noscale') >= 0) return 1;

        return ((this.getValidSize(scale) === 32) || (imageUrl.indexOf('force32') >= 0)) ? 0.5 : 1;
    }

    private getScaledOffset(offset: number, scale: number): number
    {
        return ((offset * scale) / 64);
    }

    protected getLayerXOffset(scale: number, direction: number, layerId: number): number
    {
        const offset = this._imageOffsets?.get(this.getImageFactor(scale))?.getXOffset(direction, 0);

        if(offset !== undefined) return offset + this.getScaledOffset(this._offsetX, scale);

        return super.getLayerXOffset(scale, direction, layerId) + this.getScaledOffset(this._offsetX, scale);
    }

    protected getLayerYOffset(scale: number, direction: number, layerId: number): number
    {
        const offset = this._imageOffsets?.get(this.getImageFactor(scale))?.getYOffset(direction, 0);

        if(offset !== undefined) return offset + this.getScaledOffset(this._offsetY, scale);

        return super.getLayerYOffset(scale, direction, layerId) + this.getScaledOffset(this._offsetY, scale);
    }

    protected updateSprite(scale: number, layerId: number): void
    {
        super.updateSprite(scale, layerId);

        if(!this._imageUrl || (this.getLayerTag(scale, this._direction, layerId) !== FurnitureBrandedImageVisualization.BRANDED_IMAGE)) return;

        const sprite = this.getSprite(layerId);

        if(sprite) sprite.fixedDepth = this.getBackgroundDepth();

        if(!sprite || !sprite.texture || (this.getImageFactor(scale) === 1)) return;

        const halfSizeImage = this.getHalfSizeImage(sprite.texture, layerId);

        // Until the resample is ready (or when the image cannot be read) the GPU draws it at half size.
        if(halfSizeImage) sprite.texture = halfSizeImage;
        else sprite.scale = (sprite.scale * 0.5);
    }

    private getBackgroundDepth(): number
    {
        const range = FurnitureRoomBackgroundVisualization.BACKGROUND_LAYER_DEPTH_RANGE;
        const offsetZ = Math.max(-range, Math.min(range, (this._offsetZ || 0)));

        return (FurnitureRoomBackgroundVisualization.BACKGROUND_LAYER_DEPTH - offsetZ);
    }

    /** AIR draws the image into a half-size bitmap once; built from the loaded image outside the render path. */
    private getHalfSizeImage(texture: Texture, layerId: number): Texture
    {
        if(this._halfSizeImageUrl === this._imageUrl) return this._halfSizeImage;

        this.disposeHalfSizeImage();

        const imageUrl = this._imageUrl;

        this._halfSizeImageUrl = imageUrl;

        setTimeout(() =>
        {
            if(this._halfSizeImageUrl !== imageUrl) return;

            this._halfSizeImage = CreateHalfSizeTexture(texture);

            const sprite = this.getSprite(layerId);

            if(!this._halfSizeImage || !sprite || (sprite.texture !== texture)) return;

            sprite.texture = this._halfSizeImage;
            sprite.scale = (sprite.scale * 2);
            this.updateSpriteCounter++;
        }, 0);

        return null;
    }

    private disposeHalfSizeImage(): void
    {
        if(this._halfSizeImage) this._halfSizeImage.destroy(true);

        this._halfSizeImage = null;
        this._halfSizeImageUrl = null;
    }

    public dispose(): void
    {
        this.disposeHalfSizeImage();

        super.dispose();
    }


    protected getLayerAlpha(scale: number, direction: number, layerId: number): number
    {
        let alpha = super.getLayerAlpha(scale, direction, layerId);

        if(this.shouldSuppressInkLayer(scale, direction, layerId)) alpha = 0;

        return alpha;
    }

    private shouldSuppressInkLayer(scale: number, direction: number, layerId: number): boolean
    {
        if(this.getLayerTag(scale, direction, layerId) === FurnitureBrandedImageVisualization.BRANDED_IMAGE) return false;

        return (this.getLayerBlendMode(scale, direction, layerId) !== 'normal');
    }

    protected getLayerIgnoreMouse(scale: number, direction: number, layerId: number): boolean
    {
        return true;
    }
}
