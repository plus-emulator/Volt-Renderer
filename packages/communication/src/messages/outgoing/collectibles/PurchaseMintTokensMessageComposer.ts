import { IMessageComposer } from '@volt/api';

export class PurchaseMintTokensMessageComposer implements IMessageComposer<ConstructorParameters<typeof PurchaseMintTokensMessageComposer>>
{
    private _data: ConstructorParameters<typeof PurchaseMintTokensMessageComposer>;

    constructor(offerId: number, wallet: string)
    {
        this._data = [offerId, wallet];
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
