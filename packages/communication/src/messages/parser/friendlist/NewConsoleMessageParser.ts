import { IMessageDataWrapper, IMessageParser } from '@volt/api';

// AIR WIN63-202610151745-318700621 package_18/class_1918.as:37 (content: package_20/class_3161.as:27).
export class NewConsoleMessageParser implements IMessageParser
{
    public static readonly CONTENT_TEXT: number = 0;
    public static readonly CONTENT_HABBICON: number = 1;

    private _chatId: number;
    private _messageType: number;
    private _messageText: string;
    private _habbiconId: number;
    private _secondsSinceSent: number;
    private _messageId: string;
    private _confirmationId: number;
    private _senderId: number;
    private _senderName: string;
    private _senderFigure: string;

    public flush(): boolean
    {
        this._chatId = 0;
        this._messageType = NewConsoleMessageParser.CONTENT_TEXT;
        this._messageText = null;
        this._habbiconId = 0;
        this._secondsSinceSent = 0;
        this._messageId = null;
        this._confirmationId = 0;
        this._senderId = 0;
        this._senderName = null;
        this._senderFigure = null;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._chatId = wrapper.readInt();

        const contentType = wrapper.readInt();

        switch(contentType)
        {
            case NewConsoleMessageParser.CONTENT_TEXT:
                this._messageType = NewConsoleMessageParser.CONTENT_TEXT;
                this._messageText = wrapper.readString();
                break;
            case NewConsoleMessageParser.CONTENT_HABBICON:
                this._messageType = NewConsoleMessageParser.CONTENT_HABBICON;
                this._messageText = '';
                this._habbiconId = wrapper.readInt();
                break;
            default:
                this._messageType = NewConsoleMessageParser.CONTENT_TEXT;
                this._messageText = '';
                break;
        }

        this._secondsSinceSent = wrapper.readInt();
        this._messageId = wrapper.readString();
        this._confirmationId = wrapper.readInt();
        this._senderId = wrapper.readInt();
        this._senderName = wrapper.readString();
        this._senderFigure = wrapper.readString();

        return true;
    }

    public get chatId(): number
    {
        return this._chatId;
    }

    public get messageType(): number
    {
        return this._messageType;
    }

    public get messageText(): string
    {
        return this._messageText;
    }

    public get habbiconId(): number
    {
        return this._habbiconId;
    }

    public get secondsSinceSent(): number
    {
        return this._secondsSinceSent;
    }

    public get messageId(): string
    {
        return this._messageId;
    }

    public get confirmationId(): number
    {
        return this._confirmationId;
    }

    public get senderId(): number
    {
        return this._senderId;
    }

    public get senderName(): string
    {
        return this._senderName;
    }

    public get senderFigure(): string
    {
        return this._senderFigure;
    }
}
