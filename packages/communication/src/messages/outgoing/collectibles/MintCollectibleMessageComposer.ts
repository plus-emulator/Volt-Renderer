import { IMessageComposer } from '@volt/api';

export class MintCollectibleMessageComposer implements IMessageComposer<ConstructorParameters<typeof MintCollectibleMessageComposer>>
{
    private _data: ConstructorParameters<typeof MintCollectibleMessageComposer>;

    constructor(itemId: number, wallet: string)
    {
        this._data = [itemId, wallet];
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
