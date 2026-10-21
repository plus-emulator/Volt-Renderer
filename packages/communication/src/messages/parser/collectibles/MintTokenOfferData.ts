import { IMessageDataWrapper } from '@volt/api';

/** A mint token offer bought with silver (AIR parser/collectibles/class_2843). */
export class MintTokenOfferData
{
    private _offerId: number;
    private _productCode: string;
    private _silverPrice: number;
    private _amountTokens: number;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._offerId = wrapper.readInt();
        this._productCode = wrapper.readString();
        this._silverPrice = wrapper.readInt();
        this._amountTokens = wrapper.readInt();
    }

    public get offerId(): number
    {
        return this._offerId;
    }

    public get productCode(): string
    {
        return this._productCode;
    }

    public get silverPrice(): number
    {
        return this._silverPrice;
    }

    public get amountTokens(): number
    {
        return this._amountTokens;
    }
}
