import { IMessageComposer } from '@volt/api';

export class PurchaseNftStoreOfferMessageComposer implements IMessageComposer<ConstructorParameters<typeof PurchaseNftStoreOfferMessageComposer>>
{
    private _data: ConstructorParameters<typeof PurchaseNftStoreOfferMessageComposer>;

    constructor(productCode: string, wallet: string)
    {
        this._data = [productCode, wallet];
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
