import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { IWiredVariableData } from './WiredVariableData';
import { nativeCatalogAtEnd, parseNativeWiredVariable, readNativeCatalogBoolean, readNativeCatalogCount, readNativeCatalogId } from './WiredNativeVariableData';

/** One entry of the official `addedOrUpdated` dictionary: the variable and its hash. */
export interface IWiredVariableDiffEntry
{
    hash: number;
    variable: IWiredVariableData;
}

export class WiredAllVariablesDiffParser implements IMessageParser
{
    private _allVariablesHash: number;
    private _isLastChunk: boolean;
    private _removedVariables: string[];
    private _addedOrUpdated: IWiredVariableDiffEntry[];

    public flush(): boolean
    {
        this._allVariablesHash = 0;
        this._isLastChunk = false;
        this._removedVariables = [];
        this._addedOrUpdated = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();
        try
        {
            if(!wrapper) return false;
            const hash = wrapper.readInt();
            const last = readNativeCatalogBoolean(wrapper);
            const removed: string[] = [];
            const ids = new Set<string>();
            const totalRemoved = readNativeCatalogCount(wrapper);
            for(let index = 0; index < totalRemoved; index++)
            {
                const id = readNativeCatalogId(wrapper);
                if(ids.has(id)) return false;
                ids.add(id);
                removed.push(id);
            }
            const added: IWiredVariableDiffEntry[] = [];
            const totalUpdated = readNativeCatalogCount(wrapper, 100);
            for(let index = 0; index < totalUpdated; index++)
            {
                const entryHash = wrapper.readInt();
                const variable = parseNativeWiredVariable(wrapper);
                if(ids.has(variable.variableId)) return false;
                ids.add(variable.variableId);
                added.push(Object.freeze({ hash: entryHash, variable }));
            }
            if(!nativeCatalogAtEnd(wrapper)) return false;
            this._allVariablesHash = hash;
            this._isLastChunk = last;
            this._removedVariables = Object.freeze(removed) as unknown as string[];
            this._addedOrUpdated = Object.freeze(added) as unknown as IWiredVariableDiffEntry[];
            return true;
        }
        catch
        {
            this.flush();
            return false;
        }
    }

    public get allVariablesHash(): number
    {
        return this._allVariablesHash;
    }

    public get isLastChunk(): boolean
    {
        return this._isLastChunk;
    }

    public get removedVariables(): string[]
    {
        return this._removedVariables;
    }

    public get addedOrUpdated(): IWiredVariableDiffEntry[]
    {
        return this._addedOrUpdated;
    }
}
