import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_4115: the mint tokens of a wallet. */
export class CollectibleMintTokensMessageParser implements IMessageParser
{
    private _totalTokens: number = 0;

    public flush(): boolean
    {
        this._totalTokens = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._totalTokens = wrapper.readInt();

        return true;
    }

    public get totalTokens(): number
    {
        return this._totalTokens;
    }
}
