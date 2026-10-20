import { IMessageComposer } from '@volt/api';

/**
 * Official `class_3298` (`SetAreaHideData`, 3831): the area hide widget saves
 * every change at once. Fields: furniId, rootX, rootY, width, length,
 * invisibility, wallItems, invert.
 */
export class SetAreaHideComposer implements IMessageComposer<(number | boolean)[]>
{
    private _data: (number | boolean)[];

    constructor(furniId: number, rootX: number, rootY: number, width: number, length: number, invisibility: boolean, wallItems: boolean, invert: boolean)
    {
        this._data = [furniId, rootX, rootY, width, length, invisibility, wallItems, invert];
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
