import { IMessageComposer } from '@volt/api';

export interface IWiredRegionArea
{
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Saves a furniture region, class_2519 (out 589 in WIN63-202610131318). The client of that build has no
 * call site for it; the body follows the composer constructor (class_2519.as:14-24).
 */
export class WiredLabelSaveRegionComposer implements IMessageComposer<unknown[]>
{
    private _data: unknown[];

    constructor(furniId: number, title: string, description: string, xOffset: number, yOffset: number, minWidth: number, minHeight: number, color: string, areas: IWiredRegionArea[])
    {
        this._data = [ furniId, title, description, xOffset, yOffset, minWidth, minHeight, color, areas.length ];

        for(const area of areas) this._data.push(Math.trunc(area.x), Math.trunc(area.y), Math.trunc(area.width), Math.trunc(area.height));
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
