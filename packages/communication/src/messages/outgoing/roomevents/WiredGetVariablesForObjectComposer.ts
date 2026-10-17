import { IMessageComposer } from '@volt/api';

/**
 * The inspection tab's read of one object's variables (AIR WIN63-202610151745-318700621
 * outgoing/userdefinedroomevents/wiredmenu/class_3018.as:12): type (0 furni, 1 user, -10 room) and the object id
 * (the furni's item id, the user's room index, or 0 for the room).
 */
export class WiredGetVariablesForObjectComposer implements IMessageComposer<[ number, number ]>
{
    private _data: [ number, number ];

    constructor(type: number, objectId: number)
    {
        this._data = [ type, objectId ];
    }

    public getMessageArray(): [ number, number ]
    {
        return this._data;
    }

    public dispose(): void
    { }
}
