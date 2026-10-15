import { IMessageComposer } from '@volt/api';

/** Withdraw coins from a coin chest: [chestId, amount]. AIR WIN63-202610121709 id 3731 (package_95/class_3305). */
export class ChestWithdrawCoinsComposer implements IMessageComposer<ConstructorParameters<typeof ChestWithdrawCoinsComposer>>
{
    private _data: ConstructorParameters<typeof ChestWithdrawCoinsComposer>;

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
