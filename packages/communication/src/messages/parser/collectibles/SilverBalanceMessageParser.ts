import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_2086: the user's silver. */
export class SilverBalanceMessageParser implements IMessageParser
{
    private _silverBalance: number = 0;

    public flush(): boolean
    {
        this._silverBalance = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._silverBalance = wrapper.readInt();

        return true;
    }

    public get silverBalance(): number
    {
        return this._silverBalance;
    }
}
