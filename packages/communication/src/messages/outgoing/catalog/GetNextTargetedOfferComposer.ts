import { IMessageComposer } from '@volt/api';

// AIR WIN63-202610151745-318700621 package_16/class_2524.as:11 sends no fields.
export class GetNextTargetedOfferComposer implements IMessageComposer<ConstructorParameters<typeof GetNextTargetedOfferComposer>>
{
    private _data: ConstructorParameters<typeof GetNextTargetedOfferComposer>;

    constructor()
    {
        this._data = [];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        this._data = null;
    }
}
