import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { CatalogLocalizationData } from './CatalogLocalizationData';
import { CatalogPageMessageOfferData } from './CatalogPageMessageOfferData';
import { readBoundedCatalogCount } from './catalogPacketGuards';
import { FrontPageItem } from './FrontPageItem';

export class CatalogPageMessageParser implements IMessageParser
{
    private static readonly MIN_OFFER_BYTES: number = 36;
    private static readonly MIN_FRONT_PAGE_ITEM_BYTES: number = 16;

    private _pageId: number;
    private _catalogType: string;
    private _layoutCode: string;
    private _localization: CatalogLocalizationData;
    private _offers: CatalogPageMessageOfferData[];
    private _offerId: number;
    private _acceptSeasonCurrencyAsCredits: boolean;
    private _frontPageItems: FrontPageItem[];

    public flush(): boolean
    {
        this._pageId = -1;
        this._catalogType = null;
        this._layoutCode = null;
        this._localization = null;
        this._offers = [];
        this._offerId = -1;
        this._acceptSeasonCurrencyAsCredits = false;
        this._frontPageItems = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._pageId = wrapper.readInt();
        this._catalogType = wrapper.readString();
        this._layoutCode = wrapper.readString();
        this._localization = new CatalogLocalizationData(wrapper);

        const totalOffers = readBoundedCatalogCount(wrapper, CatalogPageMessageParser.MIN_OFFER_BYTES, 'catalog page offer');

        for(let index = 0; index < totalOffers; index++)
        {
            this._offers.push(new CatalogPageMessageOfferData(wrapper));
        }

        this._offerId = wrapper.readInt();
        this._acceptSeasonCurrencyAsCredits = wrapper.readBoolean();

        if(wrapper.bytesAvailable)
        {
            const totalFrontPageItems = readBoundedCatalogCount(wrapper, CatalogPageMessageParser.MIN_FRONT_PAGE_ITEM_BYTES, 'front page item');

            for(let index = 0; index < totalFrontPageItems; index++)
            {
                this._frontPageItems.push(new FrontPageItem(wrapper));
            }
        }

        return true;
    }

    public get pageId(): number
    {
        return this._pageId;
    }

    public get catalogType(): string
    {
        return this._catalogType;
    }

    public get layoutCode(): string
    {
        return this._layoutCode;
    }

    public get localization(): CatalogLocalizationData
    {
        return this._localization;
    }

    public get offers(): CatalogPageMessageOfferData[]
    {
        return this._offers;
    }

    public get offerId(): number
    {
        return this._offerId;
    }

    public get acceptSeasonCurrencyAsCredits(): boolean
    {
        return this._acceptSeasonCurrencyAsCredits;
    }

    public get frontPageItems(): FrontPageItem[]
    {
        return this._frontPageItems;
    }
}
