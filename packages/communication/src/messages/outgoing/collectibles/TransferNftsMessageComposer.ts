import { IMessageComposer } from '@volt/api';

export class TransferNftsMessageComposer implements IMessageComposer<ConstructorParameters<typeof TransferNftsMessageComposer>>
{
    private _data: ConstructorParameters<typeof TransferNftsMessageComposer>;

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
