import { IMessageComposer } from '@volt/api';

/**
 * Accept the wired trade: [confirm]. AIR WIN63-202610121709 id 609 (package_186/class_3394, WiredTradingModel).
 * false is the first press (starts the local countdown), true the confirmation after it.
 */
export class WiredTradeAcceptComposer implements IMessageComposer<ConstructorParameters<typeof WiredTradeAcceptComposer>>
{
    private _data: ConstructorParameters<typeof WiredTradeAcceptComposer>;

    constructor(confirm: boolean)
    {
        this._data = [confirm];
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
