import { IMessageDataWrapper } from '@volt/api';

export type CollectibleMintableItemType = 's' | 'i' | 'cl';

/** A furni or clothing type that can be minted into a collectible (AIR parser/collectibles/class_4398). */
export class CollectibleMintableItemData
{
    private static readonly ITEM_TYPES: CollectibleMintableItemType[] = [ 's', 'i', 'cl' ];

    private _itemTypeId: number;
    private _startTime: number;
    private _endTime: number;
    private _regionLocked: boolean;
    private _price: number;
    private _limitedEdition: boolean;
    private _itemType: CollectibleMintableItemType;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._itemTypeId = wrapper.readInt();
        this._startTime = wrapper.readInt();
        this._endTime = wrapper.readInt();
        this._regionLocked = wrapper.readBoolean();
        this._price = wrapper.readInt();
        this._limitedEdition = wrapper.readBoolean();
        this._itemType = CollectibleMintableItemData.ITEM_TYPES[wrapper.readShort()] ?? 's';
    }

    public get itemTypeId(): number
    {
        return this._itemTypeId;
    }

    /** Unix seconds, 0 when not set. */
    public get startTime(): number
    {
        return this._startTime;
    }

    /** Unix seconds, 0 when not set. */
    public get endTime(): number
    {
        return this._endTime;
    }

    public get regionLocked(): boolean
    {
        return this._regionLocked;
    }

    /** The Emerald price. AIR calls this field the mint token price. */
    public get price(): number
    {
        return this._price;
    }

    public get limitedEdition(): boolean
    {
        return this._limitedEdition;
    }

    public get itemType(): CollectibleMintableItemType
    {
        return this._itemType;
    }
}
