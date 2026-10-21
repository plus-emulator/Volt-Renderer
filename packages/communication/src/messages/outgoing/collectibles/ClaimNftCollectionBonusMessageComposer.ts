import { IMessageComposer } from '@volt/api';

export class ClaimNftCollectionBonusMessageComposer implements IMessageComposer<ConstructorParameters<typeof ClaimNftCollectionBonusMessageComposer>>
{
    private _data: ConstructorParameters<typeof ClaimNftCollectionBonusMessageComposer>;

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
