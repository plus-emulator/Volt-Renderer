import { IMessageComposer } from '@volt/api';

/** One cached wired variable and the hash the client currently holds for it. */
export interface IWiredVariableHash
{
    variableId: string;
    hash: number;
}

/**
 * Official AIR 13 `WiredVariablesSynchronizer`: after the server answered with a
 * different `allVariablesHash`, the client sends the hashes it has cached so the
 * server can reply with only the removed and the added/updated variables.
 */
export class WiredVariableHashesComposer implements IMessageComposer<(string | number)[]>
{
    private _data: (string | number)[];

    constructor(hashes: IWiredVariableHash[])
    {
        const entries = hashes ?? [];
        if(entries.length > 4096) throw new RangeError('Too many catalog hashes');
        const ids = new Set<string>();
        for(const entry of entries)
        {
            if(!entry.variableId || entry.variableId.length > 64 || ids.has(entry.variableId)
                || !Number.isInteger(entry.hash) || entry.hash < -2147483648 || entry.hash > 2147483647)
                throw new RangeError('Invalid catalog hash');
            ids.add(entry.variableId);
        }

        this._data = [ entries.length ];

        for(const entry of entries)
        {
            this._data.push(entry.variableId);
            this._data.push(entry.hash);
        }
    }

    public getMessageArray(): (string | number)[]
    {
        return [...this._data];
    }

    public dispose(): void
    {
        return;
    }
}
