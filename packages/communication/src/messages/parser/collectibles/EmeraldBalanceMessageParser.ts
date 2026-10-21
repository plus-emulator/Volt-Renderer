import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_1875: the user's emeralds. */
export class EmeraldBalanceMessageParser implements IMessageParser
{
    private _emeraldBalance: number = 0;

    public flush(): boolean
    {
        this._emeraldBalance = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._emeraldBalance = wrapper.readInt();

        return true;
    }

    public get emeraldBalance(): number
    {
        return this._emeraldBalance;
    }
}
