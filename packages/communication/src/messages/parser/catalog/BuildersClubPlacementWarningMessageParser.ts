import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/**
 * A Builders Club placement that would hide the room (AIR WIN63-202610151745-318700621 package_71/class_2436.as:40-62):
 * typeCode (0 floor, 1 wall), pageId, offerId, extraParam, then x, y, direction for a floor item or the wall location.
 * The client confirms room.confirm.hide_room and sends the placement again with its flag set (room/class_2005.as:366-397).
 */
export class BuildersClubPlacementWarningMessageParser implements IMessageParser
{
    public static FLOOR = 0;
    public static WALL = 1;

    private _typeCode: number;
    private _pageId: number;
    private _offerId: number;
    private _extraParam: string;
    private _x: number;
    private _y: number;
    private _direction: number;
    private _wallLocation: string;

    public flush(): boolean
    {
        this._typeCode = 0;
        this._pageId = 0;
        this._offerId = 0;
        this._extraParam = '';
        this._x = 0;
        this._y = 0;
        this._direction = 0;
        this._wallLocation = '';

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._typeCode = wrapper.readInt();
        this._pageId = wrapper.readInt();
        this._offerId = wrapper.readInt();
        this._extraParam = wrapper.readString();

        if(this._typeCode === BuildersClubPlacementWarningMessageParser.FLOOR)
        {
            this._x = wrapper.readInt();
            this._y = wrapper.readInt();
            this._direction = wrapper.readInt();
        }
        else
        {
            this._wallLocation = wrapper.readString();
        }

        return true;
    }

    public get typeCode(): number
    {
        return this._typeCode;
    }

    public get pageId(): number
    {
        return this._pageId;
    }

    public get offerId(): number
    {
        return this._offerId;
    }

    public get extraParam(): string
    {
        return this._extraParam;
    }

    public get x(): number
    {
        return this._x;
    }

    public get y(): number
    {
        return this._y;
    }

    public get direction(): number
    {
        return this._direction;
    }

    public get wallLocation(): string
    {
        return this._wallLocation;
    }
}
