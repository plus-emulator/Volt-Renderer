import { IMessageComposer } from '@volt/api';

export class GetCollectibleMintingEnabledMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetCollectibleMintingEnabledMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetCollectibleMintingEnabledMessageComposer>;

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
