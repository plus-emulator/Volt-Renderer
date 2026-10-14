import { IMessageComposer } from '@volt/api';

/**
 * PickupObject, package_66/class_3322 (WIN63-202610131318-860371703, L15-41): category, id and whether the user already
 * confirmed the pickup. The flag is only written for the confirmed pickup sent after ObjectRemoveConfirm
 * (room/class_1993.as:340-363); a plain pickup keeps its two ints, which the server reads as unconfirmed.
 */
export class FurniturePickupComposer implements IMessageComposer<unknown[]>
{
    private _data: unknown[];

    constructor(category: number, objectId: number, confirmed: boolean = false)
    {
        this._data = confirmed ? [category, objectId, true] : [category, objectId];
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
