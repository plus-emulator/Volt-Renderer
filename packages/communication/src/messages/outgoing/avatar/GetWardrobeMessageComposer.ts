import { IMessageComposer } from '@volt/api';

export class GetWardrobeMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetWardrobeMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetWardrobeMessageComposer>;

    constructor()
    {
        this._data = [];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
