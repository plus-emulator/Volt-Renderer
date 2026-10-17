import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR WIN63-202610151745-318700621 package_37/class_4292.as:25: result, then the ignored user's id. */
export class IgnoreResultParser implements IMessageParser
{
    private _result: number;
    private _userId: number;

    public flush(): boolean
    {
        this._result = -1;
        this._userId = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._result = wrapper.readInt();
        this._userId = wrapper.readInt();

        return true;
    }

    public get result(): number
    {
        return this._result;
    }

    public get userId(): number
    {
        return this._userId;
    }
}
