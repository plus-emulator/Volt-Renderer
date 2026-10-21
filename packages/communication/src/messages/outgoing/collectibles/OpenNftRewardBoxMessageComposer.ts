import { IMessageComposer } from '@volt/api';

export class OpenNftRewardBoxMessageComposer implements IMessageComposer<ConstructorParameters<typeof OpenNftRewardBoxMessageComposer>>
{
    private _data: ConstructorParameters<typeof OpenNftRewardBoxMessageComposer>;

    constructor(objectId: number)
    {
        this._data = [objectId];
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
