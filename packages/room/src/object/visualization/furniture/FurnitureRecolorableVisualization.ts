import { RoomObjectVariable } from '@volt/api';
import { FurnitureAnimatedVisualization } from './FurnitureAnimatedVisualization';

/**
 * AIR WIN63-202610131318-860371703 `room/object/visualization/furniture/class_1789.as:3` (`furniture_recolorable`):
 * layers tagged `recolorable` take the furni's colour, every other layer keeps its own.
 */
export class FurnitureRecolorableVisualization extends FurnitureAnimatedVisualization
{
    public static RECOLORABLE_SPRITE_TAG: string = 'recolorable';
    public static DEFAULT_COLOR: number = 0xFFFFFF;

    private _color: number = FurnitureRecolorableVisualization.DEFAULT_COLOR;

    protected updateModel(scale: number): boolean
    {
        const updated = super.updateModel(scale);
        const color = this.object.model.getValue<number>(RoomObjectVariable.FURNITURE_RECOLORABLE_COLOR);

        this._color = ((color === undefined) || (color === null) || isNaN(color)) ? FurnitureRecolorableVisualization.DEFAULT_COLOR : color;

        return updated;
    }

    protected getLayerColor(scale: number, layerId: number, colorId: number): number
    {
        if(this.getLayerTag(scale, this._direction, layerId) === FurnitureRecolorableVisualization.RECOLORABLE_SPRITE_TAG) return this._color;

        return super.getLayerColor(scale, layerId, colorId);
    }
}
