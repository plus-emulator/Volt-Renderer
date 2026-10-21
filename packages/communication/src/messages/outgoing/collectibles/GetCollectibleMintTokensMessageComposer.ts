import { IMessageComposer } from '@volt/api';

export class GetCollectibleMintTokensMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetCollectibleMintTokensMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetCollectibleMintTokensMessageComposer>;

    constructor(wallet: string)
    {
        this._data = [wallet];
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
