import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_2238: the result of a Collectibles shop purchase, 0 ok and 1 error. */
export class NftStorePurchaseResultMessageParser implements IMessageParser
{
    private _result: number = 0;

    public flush(): boolean
    {
        this._result = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._result = wrapper.readShort();

        return true;
    }

    public get result(): number
    {
        return this._result;
    }
}
