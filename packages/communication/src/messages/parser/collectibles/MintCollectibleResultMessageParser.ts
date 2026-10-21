import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_4045: the result of minting, 1 success and 0 or 2 failure. */
export class MintCollectibleResultMessageParser implements IMessageParser
{
    private _mintResult: number = 0;

    public flush(): boolean
    {
        this._mintResult = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._mintResult = wrapper.readShort();

        return true;
    }

    public get mintResult(): number
    {
        return this._mintResult;
    }
}
