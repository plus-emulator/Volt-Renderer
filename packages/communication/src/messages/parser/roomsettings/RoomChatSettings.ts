import { IMessageDataWrapper } from '@volt/api';

export class RoomChatSettings
{
    public static CHAT_MODE_FREE_FLOW: number = 0;
    public static CHAT_MODE_LINE_BY_LINE: number = 1;
    public static CHAT_BUBBLE_WIDTH_WIDE: number = 0;
    public static CHAT_BUBBLE_WIDTH_NORMAL: number = 1;
    public static CHAT_BUBBLE_WIDTH_THIN: number = 2;
    public static CHAT_SCROLL_SPEED_FAST: number = 0;
    public static CHAT_SCROLL_SPEED_NORMAL: number = 1;
    public static CHAT_SCROLL_SPEED_SLOW: number = 2;
    public static FLOOD_FILTER_STRICT: number = 0;
    public static FLOOD_FILTER_NORMAL: number = 1;
    public static FLOOD_FILTER_LOOSE: number = 2;

    private _mode: number;
    private _weight: number;
    private _speed: number;
    private _distance: number;
    private _protection: number;

    constructor(wrapper: IMessageDataWrapper)
    {
        if(!wrapper) return;

        this._mode = wrapper.readInt();
        this._weight = wrapper.readInt();
        this._speed = wrapper.readInt();
        this._distance = wrapper.readInt();
        this._protection = wrapper.readInt();
    }

    /**
     * AIR WIN63-202610151745-318700621 package_2/class_1770.as:48: room data and room settings only carry the
     * flood sensitivity; mode, bubble width and scroll speed fall back to free flow, normal, normal.
     */
    public static fromFloodSensitivity(protection: number): RoomChatSettings
    {
        const settings = new RoomChatSettings(null);

        settings._mode = RoomChatSettings.CHAT_MODE_FREE_FLOW;
        settings._weight = RoomChatSettings.CHAT_BUBBLE_WIDTH_NORMAL;
        settings._speed = RoomChatSettings.CHAT_SCROLL_SPEED_NORMAL;
        settings._distance = 50;
        settings._protection = protection;

        return settings;
    }

    public get mode(): number
    {
        return this._mode;
    }
    public get weight(): number
    {
        return this._weight;
    }

    public get speed(): number
    {
        return this._speed;
    }

    public get distance(): number
    {
        return this._distance;
    }

    public get protection(): number
    {
        return this._protection;
    }
}
