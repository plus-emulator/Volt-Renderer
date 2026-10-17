import type { IMessageDataWrapper, IMessageParser } from '@volt/api';

export class UserSettingsParser implements IMessageParser
{
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
    private _wiredWhisperDisabled: boolean;
    private _chatMode: number;
    private _chatBubbleWidth: number;
    private _chatScrollSpeed: number;
    private _onlineIndicatorPreference: number;
    private _profileVisible: boolean;
    private _fontScale: number;
    private _wiredStylePreference: string;
    private _showAllWiredErrors: boolean;
    private _hasNativeSettingsFields: boolean;

    public flush(): boolean
    {
        this._volumeSystem = 0;
        this._volumeFurni = 0;
        this._volumeTrax = 0;
        this._oldChat = false;
        this._roomInvites = false;
        this._cameraFollow = false;
        this._flags = 0;
        this._chatType = 0;
        this._wiredMenuButton = false;
        this._wiredInspectButton = false;
        this._playTestMode = false;
        this._wiredWhisperDisabled = false;
        this._chatMode = 0;
        this._chatBubbleWidth = 1;
        this._chatScrollSpeed = 1;
        this._onlineIndicatorPreference = 0;
        this._profileVisible = true;
        this._fontScale = 0;
        this._wiredStylePreference = '';
        this._showAllWiredErrors = false;
        this._hasNativeSettingsFields = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();

        if(!wrapper || wrapper.remainingBytes === undefined || wrapper.remainingBytes < 26) return false;

        this._volumeSystem = wrapper.readInt();
        this._volumeFurni = wrapper.readInt();
        this._volumeTrax = wrapper.readInt();
        this._oldChat = wrapper.readBoolean();
        this._roomInvites = wrapper.readBoolean();
        this._cameraFollow = wrapper.readBoolean();
        this._flags = wrapper.readInt();
        this._chatType = wrapper.readInt();
        // AIR WIN63-202610151745-318700621 package_43/class_1951.as:170-172: wired menu button, wired inspect button,
        // play test mode.
        this._wiredMenuButton = wrapper.readBoolean();
        this._wiredInspectButton = wrapper.readBoolean();
        this._playTestMode = wrapper.readBoolean();

        // The verified QA serializer ends at this 26-byte prefix. Every nonempty tail follows
        // v75 Th's native field order; the older custom preference tail is not a supported format.
        if(wrapper.remainingBytes === 0) return true;
        if(wrapper.remainingBytes < 5) return false;

        wrapper.readInt();
        this._wiredWhisperDisabled = wrapper.readBoolean();

        if(wrapper.remainingBytes > 0) this._showAllWiredErrors = wrapper.readBoolean();

        if(wrapper.remainingBytes > 0)
        {
            if(wrapper.remainingBytes < 2) return false;

            const length = wrapper.readShort();

            if(length < 0 || wrapper.remainingBytes < length) return false;

            this._wiredStylePreference = wrapper.readBytes(length).toString('utf8');
        }

        if(wrapper.remainingBytes > 0)
        {
            if(wrapper.remainingBytes < 4) return false;

            this._fontScale = wrapper.readInt();
        }

        if(wrapper.remainingBytes > 0)
        {
            if(wrapper.remainingBytes < 4) return false;

            this._chatMode = wrapper.readInt();
            this._oldChat = (this._chatMode !== 0);
        }

        if(wrapper.remainingBytes > 0)
        {
            if(wrapper.remainingBytes < 4) return false;

            this._chatBubbleWidth = wrapper.readInt();
        }

        if(wrapper.remainingBytes > 0)
        {
            if(wrapper.remainingBytes < 4) return false;

            this._chatScrollSpeed = wrapper.readInt();
        }

        if(wrapper.remainingBytes > 0)
        {
            if(wrapper.remainingBytes < 4) return false;

            this._onlineIndicatorPreference = wrapper.readInt();
        }

        if(wrapper.remainingBytes !== 0) return false;

        this._hasNativeSettingsFields = true;

        return true;
    }

    public get volumeSystem(): number
    {
        return this._volumeSystem;
    }

    public get volumeFurni(): number
    {
        return this._volumeFurni;
    }

    public get volumeTrax(): number
    {
        return this._volumeTrax;
    }

    public get oldChat(): boolean
    {
        return this._oldChat;
    }

    public get roomInvites(): boolean
    {
        return this._roomInvites;
    }

    public get cameraFollow(): boolean
    {
        return this._cameraFollow;
    }

    public get flags(): number
    {
        return this._flags;
    }

    public get chatType(): number
    {
        return this._chatType;
    }

    public get wiredMenuButton(): boolean
    {
        return this._wiredMenuButton;
    }

    public get wiredInspectButton(): boolean
    {
        return this._wiredInspectButton;
    }

    public get playTestMode(): boolean
    {
        return this._playTestMode;
    }

    public get wiredWhisperDisabled(): boolean
    {
        return this._wiredWhisperDisabled;
    }

    public get chatMode(): number
    {
        return this._chatMode;
    }

    public get chatBubbleWidth(): number
    {
        return this._chatBubbleWidth;
    }

    public get chatScrollSpeed(): number
    {
        return this._chatScrollSpeed;
    }

    public get onlineIndicatorPreference(): number
    {
        return this._onlineIndicatorPreference;
    }

    public get profileVisible(): boolean
    {
        // Compatibility only: v75 UserSettings has no profile visibility field.
        return this._profileVisible;
    }

    public get fontScale(): number
    {
        return this._fontScale;
    }

    public get wiredStylePreference(): string
    {
        return this._wiredStylePreference;
    }

    public get showAllWiredErrors(): boolean
    {
        return this._showAllWiredErrors;
    }

    public get hasNativeSettingsFields(): boolean
    {
        return this._hasNativeSettingsFields;
    }
}
