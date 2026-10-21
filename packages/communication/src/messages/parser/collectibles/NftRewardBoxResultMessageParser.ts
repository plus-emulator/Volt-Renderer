import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_3343: the result of opening a reward box, 0 success, 1 failure and 2 not in the Collector Wallet. */
export class NftRewardBoxResultMessageParser implements IMessageParser
{
    private _resultCode: number = 0;

    public flush(): boolean
    {
        this._resultCode = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._resultCode = wrapper.readShort();

        return true;
    }

    public get success(): boolean
    {
        return this._resultCode === 0;
    }

    public get fail(): boolean
    {
        return this._resultCode === 1;
    }

    public get notInStarDustWallet(): boolean
    {
        return this._resultCode === 2;
    }

    public get resultCode(): number
    {
        return this._resultCode;
    }
}
