import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { RoomDataParser } from '../room';
import { RoomChatSettings, RoomModerationSettings } from '../roomsettings';

export class GetGuestRoomResultMessageParser implements IMessageParser
{
    private _roomEnter: boolean;
    private _roomForward: boolean;
    private _data: RoomDataParser;
    private _staffPick: boolean;
    private _isGroupMember: boolean;
    private _moderation: RoomModerationSettings;
    private _chat: RoomChatSettings;
    private _openingConnection: boolean;

    public flush(): boolean
    {
        this._roomEnter = false;
        this._roomForward = false;
        this._data = null;
        this._staffPick = false;
        this._isGroupMember = false;
        this._moderation = null;
        this._chat = null;
        this._openingConnection = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomEnter = wrapper.readBoolean();
        this._data = new RoomDataParser(wrapper);
        this._roomForward = wrapper.readBoolean();
        this._staffPick = wrapper.readBoolean();
        this._isGroupMember = wrapper.readBoolean();
        this.data.allInRoomMuted = wrapper.readBoolean();
        this._moderation = new RoomModerationSettings(wrapper);
        this.data.canMute = wrapper.readBoolean();
        // AIR WIN63-202610151745-318700621 package_60/class_2076.as:40: flood sensitivity, then one boolean.
        this._chat = RoomChatSettings.fromFloodSensitivity(wrapper.readInt());
        this._openingConnection = wrapper.readBoolean();

        return true;
    }

    public get roomEnter(): boolean
    {
        return this._roomEnter;
    }

    public get roomForward(): boolean
    {
        return this._roomForward;
    }

    public get data(): RoomDataParser
    {
        return this._data;
    }

    public get staffPick(): boolean
    {
        return this._staffPick;
    }

    public get isGroupMember(): boolean
    {
        return this._isGroupMember;
    }

    public get moderation(): RoomModerationSettings
    {
        return this._moderation;
    }

    public get chat(): RoomChatSettings
    {
        return this._chat;
    }

    public get openingConnection(): boolean
    {
        return this._openingConnection;
    }
}
