import { IMessageComposer } from '@volt/api';

/**
 * Withdraw stored furni of one type: [chestId, wall, typeId, posterId, amount] (ChestItemType inline).
 * AIR WIN63-202610121709 id 715 (package_95/class_2388).
 */
export class ChestWithdrawFurniComposer implements IMessageComposer<ConstructorParameters<typeof ChestWithdrawFurniComposer>>
{
    private _data: ConstructorParameters<typeof ChestWithdrawFurniComposer>;

    constructor(chestId: number, wall: boolean, typeId: number, posterId: string, amount: number)
    {
        this._data = [chestId, wall, typeId, posterId, amount];
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
