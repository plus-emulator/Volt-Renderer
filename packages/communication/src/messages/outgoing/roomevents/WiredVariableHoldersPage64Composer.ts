import { IMessageComposer } from '@volt/api';

export class WiredVariableHoldersPage64Composer implements IMessageComposer<(number | string)[]>
{
    private _data: (number | string)[];

    constructor(variableId: string, page: number, pageSize: number, userTypeFilter: number, sortTypeFilter: number)
    {
        this._data = [ 1, variableId, page, pageSize, userTypeFilter, sortTypeFilter ];
    }

    public getMessageArray(): (number | string)[]
    {
        return this._data;
    }

    public dispose(): void
    { }
}
