import { IMessageComposer } from '@volt/api';

export class GetCollectibleMintableItemTypesMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetCollectibleMintableItemTypesMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetCollectibleMintableItemTypesMessageComposer>;

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
