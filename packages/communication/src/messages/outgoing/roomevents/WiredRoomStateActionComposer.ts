import { IMessageComposer } from '@volt/api';

/**
 * The Room state buttons of the Wired menu: `false` reloads the room and everyone re-enters it,
 * `true` also puts every furni back to its place and state from the last room load.
 */
export class WiredRoomStateActionComposer implements IMessageComposer<ConstructorParameters<typeof WiredRoomStateActionComposer>>
{
    private _data: ConstructorParameters<typeof WiredRoomStateActionComposer>;

    constructor(rollback: boolean)
    {
        this._data = [ rollback ];
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
