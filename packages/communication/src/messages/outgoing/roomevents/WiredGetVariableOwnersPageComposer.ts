import { IMessageComposer } from '@volt/api';

export class WiredGetVariableOwnersPageComposer implements IMessageComposer<[ string, number, number, number, number ]>
{
    private _data: [ string, number, number, number, number ];

    constructor(variableId: string, page: number, pageSize: number, sort: number, userType: number)
    {
        this._data = [ variableId, page, pageSize, sort, userType ];
    }

    public getMessageArray(): [ string, number, number, number, number ]
    {
        return this._data;
    }

    public dispose(): void
    { }
}
