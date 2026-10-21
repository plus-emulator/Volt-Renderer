import { IMessageComposer } from '@volt/api';

export class GetCollectibleWalletAddressesMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetCollectibleWalletAddressesMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetCollectibleWalletAddressesMessageComposer>;

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
