import { IMessageDataWrapper, IMessageParser } from '@volt/api';

// AIR WIN63-202610151745-318700621 package_60/class_2544.as:29: flat id, then an optional user name.
export class FlatAccessDeniedMessageParser implements IMessageParser
{
    private _flatId: number;
    private _userName: string;

    public flush(): boolean
    {
        this._flatId = 0;
        this._userName = null;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._flatId = wrapper.readInt();

        if(wrapper.bytesAvailable) this._userName = wrapper.readString();

        return true;
    }

    public get flatId(): number
    {
        return this._flatId;
    }

    public get userName(): string
    {
        return this._userName;
    }
}
