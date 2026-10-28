import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { IWiredVariableData } from './WiredVariableData';
import { nativeCatalogAtEnd, parseNativeWiredVariable, readNativeCatalogCount } from './WiredNativeVariableData';

export interface IWiredVariableObjectHolder
{
    objectId: number;
    value: number;
}

export class WiredAllVariableHoldersParser implements IMessageParser
{
    private _variable: IWiredVariableData = null;
    private _holders: readonly IWiredVariableObjectHolder[] = [];

    public flush(): boolean
    {
        this._variable = null;
        this._holders = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();

        try
        {
            if(!wrapper) return false;

            wrapper.readInt();

            const variable = parseNativeWiredVariable(wrapper);
            const count = readNativeCatalogCount(wrapper, 1000000);
            const holders: IWiredVariableObjectHolder[] = [];

            for(let index = 0; index < count; index++)
            {
                const objectId = wrapper.readInt();

                holders.push(Object.freeze({ objectId, value: wrapper.readInt() }));
            }

            if(!nativeCatalogAtEnd(wrapper)) return false;

            this._variable = variable;
            this._holders = Object.freeze(holders);

            return true;
        }
        catch
        {
            this.flush();

            return false;
        }
    }

    public get variable(): IWiredVariableData
    {
        return this._variable;
    }

    public get holders(): readonly IWiredVariableObjectHolder[]
    {
        return this._holders;
    }
}
