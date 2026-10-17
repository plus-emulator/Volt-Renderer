import { IMessageComposer } from '@volt/api';

export class UnignoreUserComposer implements IMessageComposer<ConstructorParameters<typeof UnignoreUserComposer>>
{
    private _data: ConstructorParameters<typeof UnignoreUserComposer>;

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
