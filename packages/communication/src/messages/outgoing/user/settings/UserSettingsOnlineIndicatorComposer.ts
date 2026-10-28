import { IMessageComposer } from '@volt/api';

/**
 * Friend-online notification preference: 0 everyone, 1 users in my relationship status, 2 nobody.
 */
export class UserSettingsOnlineIndicatorComposer implements IMessageComposer<ConstructorParameters<typeof UserSettingsOnlineIndicatorComposer>>
{
    private _data: ConstructorParameters<typeof UserSettingsOnlineIndicatorComposer>;

    constructor(preference: number)
    {
        this._data = [ preference ];
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
