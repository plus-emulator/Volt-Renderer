import { IMessageComposer } from '@volt/api';

export class GetNftStoreOffersMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetNftStoreOffersMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetNftStoreOffersMessageComposer>;

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
        return;
    }
}
