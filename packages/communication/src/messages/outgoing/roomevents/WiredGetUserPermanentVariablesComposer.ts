import { IMessageComposer } from '@volt/api';

export class WiredGetUserPermanentVariablesComposer implements IMessageComposer<[ number, number ]>
{
    private _data: [ number, number ];

    constructor(entityType: number, entityId: number)
    {
        this._data = [ entityType, entityId ];
    }

    public getMessageArray(): [ number, number ]
    {
        return this._data;
    }

    public dispose(): void
    { }
}
