import { IMessageComposer } from '@volt/api';

/** Clicks a wired context menu item of a target. */
export class WiredContextMenuClickComposer implements IMessageComposer<ConstructorParameters<typeof WiredContextMenuClickComposer>>
{
    private _data: ConstructorParameters<typeof WiredContextMenuClickComposer>;

    constructor(targetType: number, targetId: number, buttonId: string)
    {
        this._data = [ targetType, targetId, buttonId ];
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
