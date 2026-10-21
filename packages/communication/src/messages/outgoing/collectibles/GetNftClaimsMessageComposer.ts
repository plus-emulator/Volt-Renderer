import { IMessageComposer } from '@volt/api';

export class GetNftClaimsMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetNftClaimsMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetNftClaimsMessageComposer>;

    constructor(wallet: string)
    {
        this._data = [wallet];
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
