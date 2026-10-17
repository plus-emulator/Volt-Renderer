import { IMessageDataWrapper, IMessageParser } from '@volt/api';

// AIR WIN63-202610151745-318700621 package_14/class_2658.as:27: flat id.
export class YouAreSpectatorMessageParser implements IMessageParser
{
    private _flatId: number;

    public flush(): boolean
    {
        this._flatId = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._flatId = wrapper.readInt();

        return true;
    }

    public get flatId(): number
    {
        return this._flatId;
    }
}
