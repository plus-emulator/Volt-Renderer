import { IMessageComposer } from '@volt/api';

export class GetCollectorScoreMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetCollectorScoreMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetCollectorScoreMessageComposer>;

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
