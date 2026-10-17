import { IMessageComposer } from '@volt/api';

/**
 * AIR WIN63-202610151745-318700621 camera/class_3087 sends an empty body. Volt adds the checkout id it was given,
 * which the server reads only when present.
 */
export class PurchasePhotoMessageComposer implements IMessageComposer<string[]>
{
    private _data: string[];

    constructor(checkoutId?: string)
    {
        if(checkoutId === null || checkoutId === '') checkoutId = undefined;

        this._data = [];

        if(checkoutId !== undefined) this._data.push(checkoutId);
    }

    public getMessageArray(): string[]
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
