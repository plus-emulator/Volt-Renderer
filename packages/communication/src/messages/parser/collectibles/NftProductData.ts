import { IMessageDataWrapper } from '@volt/api';

/** A collectible product (AIR parser/collectibles/class_2543). */
export class NftProductData
{
    private _productTypeId: number;
    private _itemTypeId: string;
    private _score: number;
    private _petFigureString: string;
    private _figureSetIds: number[];
    private _productCode: string;
    private _rarity: string;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._productTypeId = wrapper.readShort();
        this._itemTypeId = wrapper.readString();
        this._score = wrapper.readInt();
        this.readAdditionalParams(wrapper);
        this._petFigureString = wrapper.readString();
        this._figureSetIds = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._figureSetIds.push(wrapper.readInt());

        this._productCode = wrapper.readString();
        this._rarity = wrapper.readString();
    }

    protected readAdditionalParams(wrapper: IMessageDataWrapper): void
    {
        return;
    }

    public get productTypeId(): number
    {
        return this._productTypeId;
    }

    public get itemTypeId(): string
    {
        return this._itemTypeId;
    }

    public get score(): number
    {
        return this._score;
    }

    public get petFigureString(): string
    {
        return this._petFigureString;
    }

    public get figureSetIds(): number[]
    {
        return this._figureSetIds;
    }

    public get productCode(): string
    {
        return this._productCode;
    }

    public get rarity(): string
    {
        return this._rarity;
    }
}
