import { IMessageComposer } from '@volt/api';

export class GetNftTransferFeeMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetNftTransferFeeMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetNftTransferFeeMessageComposer>;

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
