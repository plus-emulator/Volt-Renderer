import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { NftClaimData } from './NftClaimData';

/** AIR parser/collectibles/class_3967: the collector reward claims. */
export class NftClaimsMessageParser implements IMessageParser
{
    private _nftClaims: NftClaimData[] = [];

    public flush(): boolean
    {
        this._nftClaims = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._nftClaims = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._nftClaims.push(new NftClaimData(wrapper));

        return true;
    }

    public get nftClaims(): NftClaimData[]
    {
        return this._nftClaims;
    }
}
