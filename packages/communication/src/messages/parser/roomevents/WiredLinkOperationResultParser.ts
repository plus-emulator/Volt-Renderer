import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { IWiredLinkNetwork, parseWiredLinkNetworks } from './WiredLinkData';

/**
 * package_113.class_2472 (in 3961 in WIN63-202610131318, parse L48-68). Operations: 1 save, 2 create,
 * 3 rename, 4 delete, 5 connections. Result 0 is success.
 */
export class WiredLinkOperationResultParser implements IMessageParser
{
    public static readonly OPERATION_SAVE = 1;
    public static readonly OPERATION_CREATE = 2;
    public static readonly OPERATION_RENAME = 3;
    public static readonly OPERATION_DELETE = 4;
    public static readonly OPERATION_CONNECTIONS = 5;

    private _roomId = 0;
    private _furniId = 0;
    private _operation = 0;
    private _resultCode = 0;
    private _hasConfiguration = false;
    private _selectedNetworkId = '0';
    private _receiveLocal = false;
    private _removedNetworkId = '';
    private _networks: IWiredLinkNetwork[] = [];

    public flush(): boolean
    {
        this._roomId = 0;
        this._furniId = 0;
        this._operation = 0;
        this._resultCode = 0;
        this._hasConfiguration = false;
        this._selectedNetworkId = '0';
        this._receiveLocal = false;
        this._removedNetworkId = '';
        this._networks = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();
        this._furniId = wrapper.readInt();
        this._operation = wrapper.readInt();
        this._resultCode = wrapper.readInt();
        this._hasConfiguration = wrapper.readBoolean();
        this._selectedNetworkId = this._hasConfiguration ? wrapper.readString() : '0';
        this._receiveLocal = this._hasConfiguration ? wrapper.readBoolean() : false;
        this._removedNetworkId = wrapper.readString();
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

    public get operation(): number
    {
        return this._operation;
    }

    public get resultCode(): number
    {
        return this._resultCode;
    }

    public get hasConfiguration(): boolean
    {
        return this._hasConfiguration;
    }

    public get selectedNetworkId(): string
    {
        return this._selectedNetworkId;
    }

    public get receiveLocal(): boolean
    {
        return this._receiveLocal;
    }

    public get removedNetworkId(): string
    {
        return this._removedNetworkId;
    }

    public get networks(): IWiredLinkNetwork[]
    {
        return this._networks;
    }
}
