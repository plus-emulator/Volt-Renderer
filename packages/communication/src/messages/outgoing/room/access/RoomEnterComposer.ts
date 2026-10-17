import { IMessageComposer } from '@volt/api';

type RoomEnterPayload = [ number, string, number ];

/**
 * AIR WIN63-202610151745-318700621 package_47/class_1982.as:11: flat id, password, and a
 * trailing int that every caller in that build leaves at its default of -1.
 */
export class RoomEnterComposer implements IMessageComposer<RoomEnterPayload>
{
    private _data: RoomEnterPayload;

    constructor(roomId: number, password: string = null)
    {
        this._data = [ roomId, (password ?? ''), -1 ];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
