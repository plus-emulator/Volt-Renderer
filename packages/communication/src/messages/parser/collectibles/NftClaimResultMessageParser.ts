import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_4301: the result of claiming the collector rewards, 0 success and any other value an error id. */
export class NftClaimResultMessageParser implements IMessageParser
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

    public get resultCode(): number
    {
        return this._resultCode;
    }
}
