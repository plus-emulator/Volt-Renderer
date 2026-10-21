import { IMessageComposer } from '@volt/api';

export class GetNftCollectionsMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetNftCollectionsMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetNftCollectionsMessageComposer>;

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
