import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { IWiredVariableData, parseWiredVariableData } from './WiredVariableData';

/** `package_215.ObjectIdAndValuePair`. */
export interface IWiredVariableHolderValue<T extends number | bigint = number>
{
    objectId: number;
    value: T;
}

export class WiredVariableHoldersParser<T extends number | bigint = number> implements IMessageParser
{
    private _roomId: number;
    private _variable: IWiredVariableData;
    private _holders: IWiredVariableHolderValue<T>[];

    protected readScalarValue(wrapper: IMessageDataWrapper): T
    {
        return wrapper.readInt() as T;
    }

    public flush(): boolean
    {
        this._roomId = 0;
        this._variable = null;
        this._holders = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();
        this._variable = parseWiredVariableData(wrapper);
        this._holders = [];

        const totalHolders = wrapper.readInt();
        if(totalHolders < 0) return false;

        for(let i = 0; i < totalHolders; i++)
        {
            this._holders.push({
                objectId: wrapper.readInt(),
                value: this.readScalarValue(wrapper)
            });
        }

        return true;
    }

    public get roomId(): number
    {
        return this._roomId;
    }

    public get variable(): IWiredVariableData
    {
        return this._variable;
    }

    public get holders(): IWiredVariableHolderValue<T>[]
    {
        return this._holders;
    }
}
