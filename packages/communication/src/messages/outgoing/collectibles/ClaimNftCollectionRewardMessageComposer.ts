import { IMessageComposer } from '@volt/api';

export class ClaimNftCollectionRewardMessageComposer implements IMessageComposer<ConstructorParameters<typeof ClaimNftCollectionRewardMessageComposer>>
{
    private _data: ConstructorParameters<typeof ClaimNftCollectionRewardMessageComposer>;

    constructor(collectionId: string, wallet: string)
    {
        this._data = [collectionId, wallet];
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
