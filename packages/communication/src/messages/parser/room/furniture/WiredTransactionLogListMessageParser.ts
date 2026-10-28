import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { readWiredSignedLong } from '../../roomevents/WiredVariableData';

export const WIRED_TRANSACTION_LIST_CHEST = 0;
export const WIRED_TRANSACTION_LIST_ROOM = 1;

export interface IWiredTransactionInfo
{
    transactionId: number;
    roomId: number;
    transactionType: number;
    definitionInfo: string;
    userId: number;
    userName: string;
    timestamp: number;
    readableTimestamp: string;
    chestCount: number;
    withdrawFurniCount: number;
    depositFurniCount: number;
    withdrawCoinsCount: number;
    depositCoinsCount: number;
}

/**
 * One page of a transaction log. Wire layout: int listType (0 chest, 1 room), long listId, int totalLogs, int page,
 * int amount, int rowCount, then per row: long transactionId, int roomId, int type, string definitionInfo, int userId,
 * string userName, long timestamp, string readableTimestamp, int chestCount, int withdrawFurni, int depositFurni,
 * int withdrawCoins, int depositCoins.
 */
export class WiredTransactionLogListMessageParser implements IMessageParser
{
    private _listType: number = WIRED_TRANSACTION_LIST_ROOM;
    private _listId: number = 0;
    private _totalLogs: number = 0;
    private _page: number = 1;
    private _amount: number = 0;
    private _logs: IWiredTransactionInfo[] = [];

    public flush(): boolean
    {
        this._listType = WIRED_TRANSACTION_LIST_ROOM;
        this._listId = 0;
        this._totalLogs = 0;
        this._page = 1;
        this._amount = 0;
        this._logs = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._listType = wrapper.readInt();
        this._listId = readWiredSignedLong(wrapper);
        this._totalLogs = wrapper.readInt();
        this._page = wrapper.readInt();
        this._amount = wrapper.readInt();

        const count = wrapper.readInt();

        this._logs = [];

        for(let i = 0; i < count; i++)
        {
            this._logs.push({
                transactionId: readWiredSignedLong(wrapper),
                roomId: wrapper.readInt(),
                transactionType: wrapper.readInt(),
                definitionInfo: wrapper.readString(),
                userId: wrapper.readInt(),
                userName: wrapper.readString(),
                timestamp: readWiredSignedLong(wrapper),
                readableTimestamp: wrapper.readString(),
                chestCount: wrapper.readInt(),
                withdrawFurniCount: wrapper.readInt(),
                depositFurniCount: wrapper.readInt(),
                withdrawCoinsCount: wrapper.readInt(),
                depositCoinsCount: wrapper.readInt()
            });
        }

        return true;
    }

    public get listType(): number
    {
        return this._listType;
    }

    public get listId(): number
    {
        return this._listId;
    }

    public get totalLogs(): number
    {
        return this._totalLogs;
    }

    public get page(): number
    {
        return this._page;
    }

    public get amount(): number
    {
        return this._amount;
    }

    public get logs(): IWiredTransactionInfo[]
    {
        return this._logs;
    }
}
