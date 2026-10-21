import { IMessageDataWrapper } from '@volt/api';
import { NftProductData } from './NftProductData';

/** A Collectibles shop offer (AIR parser/collectibles/class_3825). */
export class NftStoreOfferData
{
    private _productCode: string;
    private _emeraldPrice: number;
    private _isFeatured: boolean;
    private _isLimited: boolean;
    private _mintLimit: number;
    private _mintedCount: number;
    private _productInfo: NftProductData;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._productCode = wrapper.readString();
        this._emeraldPrice = wrapper.readInt();
        this._isFeatured = wrapper.readBoolean();
        this._isLimited = wrapper.readBoolean();
        this._mintLimit = wrapper.readInt();
        this._mintedCount = wrapper.readInt();
        this._productInfo = new NftProductData(wrapper);
    }

    public get productCode(): string
    {
        return this._productCode;
    }

    public get emeraldPrice(): number
    {
        return this._emeraldPrice;
    }

    public get isFeatured(): boolean
    {
        return this._isFeatured;
    }

    public get isLimited(): boolean
    {
        return this._isLimited;
    }

    /** -1 when the offer has no limit. */
    public get mintLimit(): number
    {
        return this._mintLimit;
    }

    public get mintedCount(): number
    {
        return this._mintedCount;
    }

    public get productInfo(): NftProductData
    {
        return this._productInfo;
    }
}
