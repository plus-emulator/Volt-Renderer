import { IMessageComposer } from '@volt/api';

export class ClaimNftRewardsMessageComposer implements IMessageComposer<ConstructorParameters<typeof ClaimNftRewardsMessageComposer>>
{
    private _data: ConstructorParameters<typeof ClaimNftRewardsMessageComposer>;

    constructor(first: string = '', second: string = '')
    {
        this._data = [first, second];
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
