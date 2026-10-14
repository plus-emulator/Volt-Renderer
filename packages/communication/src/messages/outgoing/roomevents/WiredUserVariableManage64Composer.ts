import { IMessageComposer } from '@volt/api';
import { wiredInt64Parts } from '../../parser/roomevents/WiredInt64';

export class WiredUserVariableManage64Composer implements IMessageComposer<(number | string)[]>
{
    private _data: (number | string)[];

    constructor(action: number, targetType: number, targetId: number, variableItemId: number, value: bigint | string | number)
    {
        this._data = [ 1, action, targetType, targetId, variableItemId, ...wiredInt64Parts(value) ];
    }

    public getMessageArray(): (number | string)[]
    {
        return this._data;
    }

    public dispose(): void
    { }
}
