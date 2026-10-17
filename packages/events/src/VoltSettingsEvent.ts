import { VoltEvent } from './core';

export class VoltSettingsEvent extends VoltEvent
{
    public static SETTINGS_UPDATED: string = 'NSE_SETTINGS_UPDATED';

    private _volumeSystem: number;
    private _volumeFurni: number;
    private _volumeTrax: number;
    private _oldChat: boolean;
    private _roomInvites: boolean;
    private _cameraFollow: boolean;
    private _flags: number;
    private _chatType: number;
    private _wiredMenuButton: boolean;
    private _wiredInspectButton: boolean;
    private _playTestMode: boolean;
    private _profileVisible: boolean = true;

    constructor()
    {
        super(VoltSettingsEvent.SETTINGS_UPDATED);
    }

    public clone(): VoltSettingsEvent
    {
        const clone = new VoltSettingsEvent();

        clone._volumeSystem = this._volumeSystem;
        clone._volumeFurni = this._volumeFurni;
        clone._volumeTrax = this._volumeTrax;
        clone._oldChat = this._oldChat;
        clone._roomInvites = this._roomInvites;
        clone._cameraFollow = this._cameraFollow;
        clone._flags = this._flags;
        clone._chatType = this._chatType;
        clone._wiredMenuButton = this._wiredMenuButton;
        clone._wiredInspectButton = this._wiredInspectButton;
        clone._playTestMode = this._playTestMode;
        clone._profileVisible = this._profileVisible;

        return clone;
    }

    public get volumeSystem(): number
    {
        return this._volumeSystem;
    }

    public set volumeSystem(volume: number)
    {
        this._volumeSystem = volume;
    }

    public get volumeFurni(): number
    {
        return this._volumeFurni;
    }

    public set volumeFurni(volume: number)
    {
        this._volumeFurni = volume;
    }

    public get volumeTrax(): number
    {
        return this._volumeTrax;
    }

    public set volumeTrax(volume: number)
    {
        this._volumeTrax = volume;
    }

    public get oldChat(): boolean
    {
        return this._oldChat;
    }

    public set oldChat(value: boolean)
    {
        this._oldChat = value;
    }

    public get roomInvites(): boolean
    {
        return this._roomInvites;
    }

    public set roomInvites(value: boolean)
    {
        this._roomInvites = value;
    }

    public get cameraFollow(): boolean
    {
        return this._cameraFollow;
    }

    public set cameraFollow(value: boolean)
    {
        this._cameraFollow = value;
    }

    public get flags(): number
    {
        return this._flags;
    }

    public set flags(flags: number)
    {
        this._flags = flags;
    }

    public get chatType(): number
    {
        return this._chatType;
    }

    public set chatType(type: number)
    {
        this._chatType = type;
    }

    public get wiredMenuButton(): boolean
    {
        return this._wiredMenuButton;
    }

    public set wiredMenuButton(value: boolean)
    {
        this._wiredMenuButton = value;
    }

    public get wiredInspectButton(): boolean
    {
        return this._wiredInspectButton;
    }

    public set wiredInspectButton(value: boolean)
    {
        this._wiredInspectButton = value;
    }

    public get playTestMode(): boolean
    {
        return this._playTestMode;
    }

    public set playTestMode(value: boolean)
    {
        this._playTestMode = value;
    }

    /** Whether other users see the full extended profile. */
    public get profileVisible(): boolean
    {
        return this._profileVisible;
    }

    public set profileVisible(value: boolean)
    {
        this._profileVisible = value;
    }
}
