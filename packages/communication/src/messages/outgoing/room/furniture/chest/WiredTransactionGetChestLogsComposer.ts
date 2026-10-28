import { IMessageComposer } from '@volt/api';

/** Requests one page of one chest's transaction log. [chestId, amount, page]. Pages are 1-based. */
export class WiredTransactionGetChestLogsComposer implements IMessageComposer<ConstructorParameters<typeof WiredTransactionGetChestLogsComposer>>
{
    private _data: ConstructorParameters<typeof WiredTransactionGetChestLogsComposer>;

    constructor(chestId: number, amount: number, page: number)
    {
        this._data = [chestId, amount, page];
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
