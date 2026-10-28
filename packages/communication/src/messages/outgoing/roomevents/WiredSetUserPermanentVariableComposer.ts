import { IMessageComposer } from '@volt/api';

export class WiredSetUserPermanentVariableComposer implements IMessageComposer<[ number, number, string, number, number ]>
{
    public static readonly SET_VALUE = 0;
    public static readonly CREATE = 1;
    public static readonly DELETE = 2;

    private _data: [ number, number, string, number, number ];

    constructor(entityType: number, entityId: number, variableId: string, value: number, action: number)
    {
        this._data = [ entityType, entityId, variableId, value, action ];
    }

    public getMessageArray(): [ number, number, string, number, number ]
    {
        return this._data;
    }

    public dispose(): void
    { }
}
