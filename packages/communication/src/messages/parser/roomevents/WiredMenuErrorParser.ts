import { IMessageDataWrapper, IMessageParser } from '@volt/api';

export class WiredMenuErrorParser implements IMessageParser
{
    public static readonly OWNER_ONLY = 7;

    private _errorCode = 0;

    public flush(): boolean
    {
        this._errorCode = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._errorCode = wrapper.readShort();

        return true;
    }

    public get errorCode(): number
    {
        return this._errorCode;
    }
}
