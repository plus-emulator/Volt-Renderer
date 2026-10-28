import { IMessageComposer } from '@volt/api';

/** Requests one page of the room's wired chest transaction log. [amount, page]. Pages are 1-based. */
export class WiredTransactionGetRoomLogsComposer implements IMessageComposer<ConstructorParameters<typeof WiredTransactionGetRoomLogsComposer>>
{
    private _data: ConstructorParameters<typeof WiredTransactionGetRoomLogsComposer>;

    constructor(amount: number, page: number)
    {
        this._data = [amount, page];
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
