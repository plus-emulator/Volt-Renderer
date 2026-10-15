import { IMessageComposer } from '@volt/api';

/**
 * The lock, auto-lock and capacity switches on the chest window: [chestId, locked, autoLock, capacity].
 * AIR WIN63-202610121709 id 1211 (package_95/class_3275).
 */
export class ChestSaveOptionsComposer implements IMessageComposer<ConstructorParameters<typeof ChestSaveOptionsComposer>>
{
    private _data: ConstructorParameters<typeof ChestSaveOptionsComposer>;

    constructor(chestId: number, locked: boolean, autoLock: boolean, capacity: number)
    {
        this._data = [chestId, locked, autoLock, capacity];
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
