import { IMessageComposer } from '@volt/api';

/** Asks for the wired context menu items of a target. targetType 0 is a room unit and targetId its room index. */
export class GetWiredContextMenuComposer implements IMessageComposer<ConstructorParameters<typeof GetWiredContextMenuComposer>>
{
    private _data: ConstructorParameters<typeof GetWiredContextMenuComposer>;

    constructor(targetType: number, targetId: number)
    {
        this._data = [ targetType, targetId ];
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
