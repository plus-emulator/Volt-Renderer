import { IMessageComposer } from '@volt/api';

/** Buy extra chest capacity: [chestId, amount]. AIR WIN63-202610121709 id 2964 (package_95/class_3721). */
export class ChestUpgradeCapacityComposer implements IMessageComposer<ConstructorParameters<typeof ChestUpgradeCapacityComposer>>
{
    private _data: ConstructorParameters<typeof ChestUpgradeCapacityComposer>;

    constructor(chestId: number, amount: number)
    {
        this._data = [chestId, amount];
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
