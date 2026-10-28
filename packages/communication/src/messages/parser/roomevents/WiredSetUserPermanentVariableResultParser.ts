import { IMessageDataWrapper, IMessageParser } from '@volt/api';

export class WiredSetUserPermanentVariableResultParser implements IMessageParser
{
    private _success = false;

    public flush(): boolean
    {
        this._success = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._success = wrapper.readBoolean();

        return true;
    }

    public get success(): boolean
    {
        return this._success;
    }
}
