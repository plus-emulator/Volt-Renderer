import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { IWiredLinkNetwork, parseWiredLinkNetworks } from './WiredLinkData';

/** package_113.class_3325 (in 3405 in WIN63-202610131318): the selected network and the owner's networks. */
export class WiredLinkConfigurationParser implements IMessageParser
{
    private _roomId = 0;
    private _furniId = 0;
    private _selectedNetworkId = '0';
    private _receiveLocal = false;
    private _networks: IWiredLinkNetwork[] = [];

    public flush(): boolean
    {
        this._roomId = 0;
        this._furniId = 0;
        this._selectedNetworkId = '0';
        this._receiveLocal = false;
        this._networks = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();
        this._furniId = wrapper.readInt();
        this._selectedNetworkId = wrapper.readString();
        this._receiveLocal = wrapper.readBoolean();
        this._networks = parseWiredLinkNetworks(wrapper);

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

    public get selectedNetworkId(): string
    {
        return this._selectedNetworkId;
    }

    public get receiveLocal(): boolean
    {
        return this._receiveLocal;
    }

    public get networks(): IWiredLinkNetwork[]
    {
        return this._networks;
    }
}
