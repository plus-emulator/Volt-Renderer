import { IMessageComposer } from '@volt/api';

export class WiredVariableHoldersRequest64Composer implements IMessageComposer<(number | string)[]>
{
    private _data: (number | string)[];

    constructor(variableId: string)
    {
        this._data = [ 1, variableId ];
    }

    public getMessageArray(): (number | string)[]
    {
        return this._data;
    }

    public dispose(): void
    { }
}
