import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { IWiredVariableTimedValue, readWiredVariableStorage } from './WiredVariableStorageParameter';

export interface IWiredUserVariablesEntry extends IWiredVariableTimedValue
{
    entityType: number;
    entityId: number;
    entityName: string;
}

export class WiredUserVariablesListParser implements IMessageParser
{
    private _variableId = '';
    private _totalEntries = 0;
    private _page = 0;
    private _amount = 0;
    private _entries: readonly IWiredUserVariablesEntry[] = [];
    private _userTypeFilter = 0;
    private _sortFilter = 0;

    public flush(): boolean
    {
        this._variableId = '';
        this._totalEntries = 0;
        this._page = 0;
        this._amount = 0;
        this._entries = [];
        this._userTypeFilter = 0;
        this._sortFilter = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();

        try
        {
            if(!wrapper) return false;

            const variableId = wrapper.readString();
            const totalEntries = wrapper.readInt();
            const page = wrapper.readInt();
            const amount = wrapper.readInt();
            const count = wrapper.readInt();

            if(count < 0) return false;

            const entries: IWiredUserVariablesEntry[] = [];

            for(let index = 0; index < count; index++)
            {
                const entityType = wrapper.readInt();
                const entityId = wrapper.readInt();
                const entityName = wrapper.readString();

                entries.push(Object.freeze({ entityType, entityId, entityName, ...readWiredVariableStorage(wrapper) }));
            }

            this._variableId = variableId;
            this._totalEntries = totalEntries;
            this._page = page;
            this._amount = amount;
            this._entries = Object.freeze(entries);
            this._userTypeFilter = wrapper.readInt();
            this._sortFilter = wrapper.readInt();

            return wrapper.remainingBytes === 0;
        }
        catch
        {
            this.flush();

            return false;
        }
    }

    public get variableId(): string
    {
        return this._variableId;
    }

    public get totalEntries(): number
    {
        return this._totalEntries;
    }

    public get page(): number
    {
        return this._page;
    }

    public get amount(): number
    {
        return this._amount;
    }

    public get entries(): readonly IWiredUserVariablesEntry[]
    {
        return this._entries;
    }

    public get userTypeFilter(): number
    {
        return this._userTypeFilter;
    }

    public get sortFilter(): number
    {
        return this._sortFilter;
    }
}
