import { IMessageComposer } from '@volt/api';

export class GetIgnoredUsersComposer implements IMessageComposer<ConstructorParameters<typeof GetIgnoredUsersComposer>>
{
    private _data: ConstructorParameters<typeof GetIgnoredUsersComposer>;

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
