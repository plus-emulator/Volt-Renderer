import { IMessageComposer } from '@volt/api';

export class GetMintTokenOffersMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetMintTokenOffersMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetMintTokenOffersMessageComposer>;

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
