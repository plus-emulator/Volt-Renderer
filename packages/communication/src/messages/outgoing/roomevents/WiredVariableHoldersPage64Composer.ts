import { IMessageComposer } from '@volt/api';

export class WiredVariableHoldersPage64Composer implements IMessageComposer<(number | string)[]>
{
    private _data: (number | string)[];

    constructor(variableId: string, page: number, pageSize: number, sortTypeFilter: number, userTypeFilter: number)
    {
        this._data = [ 1, variableId, page, pageSize, sortTypeFilter, userTypeFilter ];
    }

    public getMessageArray(): (number | string)[]
    {
        return this._data;
    }

    public dispose(): void
    { }
}
