import { IMessageComposer } from '@volt/api';

export class WiredDeleteAllVariableHoldersComposer implements IMessageComposer<[ string ]>
{
    private _data: [ string ];

    constructor(variableId: string)
    {
        this._data = [ variableId ];
    }

    public getMessageArray(): [ string ]
    {
        return this._data;
    }

    public dispose(): void
    { }
}
