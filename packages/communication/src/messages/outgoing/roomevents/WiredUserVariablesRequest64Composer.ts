import { IMessageComposer } from '@volt/api';

export class WiredUserVariablesRequest64Composer implements IMessageComposer<(number | string)[]>
{
    private _data: (number | string)[];

    constructor()
    {
        this._data = [ 1 ];
    }

    public getMessageArray(): (number | string)[]
    {
        return this._data;
    }

    public dispose(): void
    { }
}
