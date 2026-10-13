import { IMessageDataWrapper, IMessageParser } from '@octane/api';

export class RoomUnitChatParser implements IMessageParser
{
    private _roomIndex: number;
    private _message: string;
    private _gesture: number;
    private _bubble: number;
    private _urls: string[];
    private _messageLength: number;
    private _receiverRoomIndex: number;
    private _bubbleWidthOverride: number;
    private _hideUsername: boolean;

    public flush(): boolean
    {
        this._roomIndex = null;
        this._message = null;
        this._gesture = 0;
        this._bubble = 0;
        this._urls = [];
        this._messageLength = 0;
        this._receiverRoomIndex = -1;
        this._bubbleWidthOverride = -1;
        this._hideUsername = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomIndex = wrapper.readInt();
        this._message = wrapper.readString();
        this._gesture = wrapper.readInt();
        this._bubble = wrapper.readInt();

        this.parseUrls(wrapper);

        this._messageLength = wrapper.readInt();
        // The October tail, each field optional: the receiver's room index (whispers), a wired bubble width
        // (-1 leaves the room setting in charge) and whether the bubble hides the speaker's name.
        this._receiverRoomIndex = (wrapper.bytesAvailable ? wrapper.readInt() : -1);
        this._bubbleWidthOverride = (wrapper.bytesAvailable ? wrapper.readInt() : -1);
        this._hideUsername = (wrapper.bytesAvailable ? wrapper.readBoolean() : false);

        return true;
    }

    private parseUrls(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._urls = [];

        let totalUrls = wrapper.readInt();

        while(totalUrls > 0)
        {
            this._urls.push(wrapper.readString());

            totalUrls--;
        }

        return true;
    }

    public get roomIndex(): number
    {
        return this._roomIndex;
    }

    public get message(): string
    {
        return this._message;
    }

    public get gesture(): number
    {
        return this._gesture;
    }

    public get bubble(): number
    {
        return this._bubble;
    }

    public get urls(): string[]
    {
        return this._urls;
    }

    public get messageLength(): number
    {
        return this._messageLength;
    }

    public get receiverRoomIndex(): number
    {
        return this._receiverRoomIndex;
    }

    public get bubbleWidthOverride(): number
    {
        return this._bubbleWidthOverride;
    }

    public get hideUsername(): boolean
    {
        return this._hideUsername;
    }
}
