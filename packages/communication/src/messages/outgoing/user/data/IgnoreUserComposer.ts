import { IMessageComposer } from '@volt/api';

export class IgnoreUserComposer implements IMessageComposer<ConstructorParameters<typeof IgnoreUserComposer>>
{
    private _data: ConstructorParameters<typeof IgnoreUserComposer>;

    constructor(userId: number)
    {
        this._data = [userId];
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
