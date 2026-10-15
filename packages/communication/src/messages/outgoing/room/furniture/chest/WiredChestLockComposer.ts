import { IMessageComposer } from '@volt/api';

/**
 * Lock or unlock the room's wired chests: [lock, all]. AIR WIN63-202610121709 id 1323 (package_95/class_3508,
 * WiredMenuChestsTab). The server sends no answer; the new state arrives through the chests' stuff data.
 */
export class WiredChestLockComposer implements IMessageComposer<ConstructorParameters<typeof WiredChestLockComposer>>
{
    private _data: ConstructorParameters<typeof WiredChestLockComposer>;

    constructor(lock: boolean, all: boolean)
    {
        this._data = [lock, all];
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
