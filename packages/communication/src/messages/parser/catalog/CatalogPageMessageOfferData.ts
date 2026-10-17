import { IMessageDataWrapper } from '@volt/api';
import { CatalogPageMessageProductData } from './CatalogPageMessageProductData';
import { readBoundedCatalogCount } from './catalogPacketGuards';

// AIR WIN63-202610151745-318700621 package_5/class_1948.as:35
export class CatalogPageMessageOfferData
{
    // productType(2) + extraParam(2) — the badge branch, the smallest product
    private static readonly MIN_PRODUCT_BYTES: number = 4;

    private _offerId: number;
    private _localizationId: string;
    private _rent: boolean;
    private _priceCredits: number;
    private _priceActivityPoints: number;
    private _priceActivityPointsType: number;
    private _priceSilver: number;
    private _clubLevel: number;
    private _giftable: boolean;
    private _bundlePurchaseAllowed: boolean;
    private _isPet: boolean;
    private _previewImage: string;
    private _products: CatalogPageMessageProductData[];

    constructor(wrapper: IMessageDataWrapper)
    {
        this._offerId = wrapper.readInt();
        this._localizationId = wrapper.readString();
        this._rent = wrapper.readBoolean();
        this._priceCredits = wrapper.readInt();
        this._priceActivityPoints = wrapper.readInt();
        this._priceActivityPointsType = wrapper.readInt();
        this._priceSilver = wrapper.readInt();
        this._giftable = wrapper.readBoolean();

        this._products = [];

        const totalProducts = readBoundedCatalogCount(wrapper, CatalogPageMessageOfferData.MIN_PRODUCT_BYTES, 'offer product');

        for(let index = 0; index < totalProducts; index++)
        {
            this._products.push(new CatalogPageMessageProductData(wrapper));
        }

        this._clubLevel = wrapper.readInt();
        this._bundlePurchaseAllowed = wrapper.readBoolean();
        this._isPet = wrapper.readBoolean();
        this._previewImage = wrapper.readString();
    }

    public get offerId(): number
    {
        return this._offerId;
    }

    public get localizationId(): string
    {
        return this._localizationId;
    }

    public get rent(): boolean
    {
        return this._rent;
    }

    public get priceCredits(): number
    {
        return this._priceCredits;
    }

    public get priceActivityPoints(): number
    {
        return this._priceActivityPoints;
    }

    public get priceActivityPointsType(): number
    {
        return this._priceActivityPointsType;
    }

    public get priceSilver(): number
    {
        return this._priceSilver;
    }

    public get clubLevel(): number
    {
        return this._clubLevel;
    }

    public get giftable(): boolean
    {
        return this._giftable;
    }

    public get bundlePurchaseAllowed(): boolean
    {
        return this._bundlePurchaseAllowed;
    }

    public get isPet(): boolean
    {
        return this._isPet;
    }

    public get previewImage(): string
    {
        return this._previewImage;
    }

    public get products(): CatalogPageMessageProductData[]
    {
        return this._products;
    }
}
