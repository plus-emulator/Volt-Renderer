import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { MintTokenOfferData } from './MintTokenOfferData';

/** AIR parser/collectibles/class_4112: the mint token offers. */
export class MintTokenOffersMessageParser implements IMessageParser
{
    private _tokenOffers: MintTokenOfferData[] = [];

    public flush(): boolean
    {
        this._tokenOffers = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._tokenOffers = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._tokenOffers.push(new MintTokenOfferData(wrapper));

        return true;
    }

    public get tokenOffers(): MintTokenOfferData[]
    {
        return this._tokenOffers;
    }
}
