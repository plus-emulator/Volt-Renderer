import { IMessageComposer } from '@volt/api';

/**
 * Official `HabboCatalog.getPublicMarketPlaceOffers` request
 * `(min:int, max:int, query:String, type:int, combineUniques:Boolean = true, offerType:int = 0)`.
 * `combineUniques` is the `combine_uniques_checkbox` of `marketplace_search_simple`:
 * when true the server folds identical LTD offers into one row, when false every
 * unique copy is listed on its own.
 * `offerType` is the offer source filter: 0 all offers, 1 collectibles, 2 furni.
 */
export class GetMarketplaceOffersMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetMarketplaceOffersMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetMarketplaceOffersMessageComposer>;

    constructor(min: number, max: number, query: string, type: number, combineUniques: boolean = true, offerType: number = 0)
    {
        this._data = [min, max, query, type, combineUniques, offerType];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        this._data = null;
    }
}
