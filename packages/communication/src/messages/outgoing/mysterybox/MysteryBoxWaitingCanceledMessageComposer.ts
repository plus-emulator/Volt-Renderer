import { IMessageComposer } from '@volt/api';

export class MysteryBoxWaitingCanceledMessageComposer implements IMessageComposer<ConstructorParameters<typeof MysteryBoxWaitingCanceledMessageComposer>>
{
    private _data: ConstructorParameters<typeof MysteryBoxWaitingCanceledMessageComposer>;

    constructor(boxOwnerUserId: number)
    {
        this._data = [ boxOwnerUserId ];
    }

    dispose(): void
    {
        this._data = null;
    }

    public getMessageArray()
    {
        return this._data;
    }
}
