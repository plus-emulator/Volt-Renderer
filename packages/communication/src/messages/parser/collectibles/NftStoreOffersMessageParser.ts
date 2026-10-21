import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { NftStoreOfferData } from './NftStoreOfferData';

/** AIR parser/collectibles/class_3977: the Collectibles shop offers. */
export class NftStoreOffersMessageParser implements IMessageParser
{
    private _nftStoreOffers: NftStoreOfferData[] = [];

    public flush(): boolean
    {
        this._nftStoreOffers = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._nftStoreOffers = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._nftStoreOffers.push(new NftStoreOfferData(wrapper));

        return true;
    }

    public get nftStoreOffers(): NftStoreOfferData[]
    {
        return this._nftStoreOffers;
    }
}
