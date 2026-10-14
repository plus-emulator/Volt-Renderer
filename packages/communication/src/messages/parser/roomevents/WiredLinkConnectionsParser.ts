import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { IWiredLinkConnection, parseWiredLinkConnection } from './WiredLinkData';

/** package_113.class_3701 (in 3962 in WIN63-202610131318): every wf_link joined to a network. */
export class WiredLinkConnectionsParser implements IMessageParser
{
    private _roomId = 0;
    private _furniId = 0;
    private _networkId = '';
    private _connections: IWiredLinkConnection[] = [];

    public flush(): boolean
    {
        this._roomId = 0;
        this._furniId = 0;
        this._networkId = '';
        this._connections = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();
        this._furniId = wrapper.readInt();
        this._networkId = wrapper.readString();

        const count = wrapper.readInt();
        const connections: IWiredLinkConnection[] = [];

        for(let i = 0; i < count; i++) connections.push(parseWiredLinkConnection(wrapper));

        this._connections = connections;

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

    public get networkId(): string
    {
        return this._networkId;
    }

    public get connections(): IWiredLinkConnection[]
    {
        return this._connections;
    }
}
