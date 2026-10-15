import { IMessageComposer } from '@volt/api';

/**
 * Start adding to a chest: [chestId]. AIR WIN63-202610121709 id 3268 (package_95/class_3668). The server answers by
 * opening a wired trade (WiredTradeOpen 84); furni and credit furni are then offered through the trade window.
 */
export class ChestStartDepositComposer implements IMessageComposer<ConstructorParameters<typeof ChestStartDepositComposer>>
{
    private _data: ConstructorParameters<typeof ChestStartDepositComposer>;

    constructor(chestId: number)
    {
        this._data = [chestId];
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
