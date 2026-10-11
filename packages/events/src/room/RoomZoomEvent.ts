import { PointData } from 'pixi.js';
import { RoomEngineEvent } from './RoomEngineEvent';

export class RoomZoomEvent extends RoomEngineEvent
{
    public static ROOM_ZOOM: string = 'REE_ROOM_ZOOM';

    private _level: number;
    private _isFlipForced: boolean;
    private _point: PointData;

    /** `point` is the canvas position to zoom around (AIR ctrl+alt+click); null zooms around the centre. */
    constructor(roomId: number, level: number, isFlipForced: boolean = false, point: PointData = null)
    {
        super(RoomZoomEvent.ROOM_ZOOM, roomId);

        this._level = level;
        this._isFlipForced = isFlipForced;
        this._point = point;
    }

    public get level(): number
    {
        return this._level;
    }

    public get isFlipForced(): boolean
    {
        return this._isFlipForced;
    }

    public get point(): PointData
    {
        return this._point;
    }
}
