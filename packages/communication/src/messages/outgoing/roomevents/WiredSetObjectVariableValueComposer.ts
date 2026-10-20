import { IMessageComposer } from '@volt/api';

/**
 * The inspection tab's write of one variable on one object (AIR WIN63-202610151745-318700621
 * outgoing/userdefinedroomevents/wiredmenu/class_3782.as): type (0 furni, 1 user, -10 room), the object id, the variable id,
 * the value and the operation (0 write, 1 create, 2 delete).
 */
export class WiredSetObjectVariableValueComposer implements IMessageComposer<[ number, number, string, number, number ]>
{
    public static readonly WRITE = 0;
    public static readonly CREATE = 1;
    public static readonly DELETE = 2;

    private _data: [ number, number, string, number, number ];

    constructor(type: number, objectId: number, variableId: string, value: number, operation: number)
    {
        this._data = [ type, objectId, variableId, value, operation ];
    }

    public getMessageArray(): [ number, number, string, number, number ]
    {
        return this._data;
    }

    public dispose(): void
    { }
}
