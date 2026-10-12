import { IMessageComposer } from '@volt/api';

/**
 * Official `MoveEntityInFlatMessageComposer` (2282): moves or turns a rentable
 * bot in the room. AIR sends the bot's room index (its room object id), not
 * its web id, followed by the tile and the direction in 45 degree steps.
 */
export class MoveEntityInFlatMessageComposer implements IMessageComposer<ConstructorParameters<typeof MoveEntityInFlatMessageComposer>>
{
    private _data: ConstructorParameters<typeof MoveEntityInFlatMessageComposer>;

    constructor(roomIndex: number, x: number, y: number, direction: number)
    {
        this._data = [roomIndex, x, y, direction];
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
