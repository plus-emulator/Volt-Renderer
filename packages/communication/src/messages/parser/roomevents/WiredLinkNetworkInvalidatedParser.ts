import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** package_113.class_2440 (in 999 in WIN63-202610131318): a network shown for this furni no longer exists. */
export class WiredLinkNetworkInvalidatedParser implements IMessageParser
{
    private _roomId = 0;
    private _furniId = 0;
    private _deletedNetworkId = '';

    public flush(): boolean
    {
        this._roomId = 0;
        this._furniId = 0;
        this._deletedNetworkId = '';

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();
        this._furniId = wrapper.readInt();
        this._deletedNetworkId = wrapper.readString();

        return true;
    }

    public get roomId(): number
    {
        return this._roomId;
    }

    public get furniId(): number
    {
        return this._furniId;
    }

    public get deletedNetworkId(): string
    {
        return this._deletedNetworkId;
    }
}
