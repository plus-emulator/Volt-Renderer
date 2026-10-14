import { IMessageComposer } from '@volt/api';

/**
 * October `package_100.class_2402` (3047): the recolor window's Apply. `scope` is
 * `furniture.recolor.scope.0-3`; the colour travels as three separate channel values.
 */
export class RecolorFurnitureComposer implements IMessageComposer<number[]>
{
    private _data: number[];

    constructor(objectId: number, scope: number, color: number)
    {
        this._data = [objectId, scope, (color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
