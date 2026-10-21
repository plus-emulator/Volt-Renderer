import { IMessageDataWrapper } from '@volt/api';
import { NftProductData } from './NftProductData';

/** The product a reward claim gives, with its set (AIR parser/collectibles/class_4407). */
export class NftClaimItemData extends NftProductData
{
    private _setId: string;
    private _defaultCollectionName: string;

    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);

        this._setId = wrapper.readString();
        this._defaultCollectionName = wrapper.readString();
    }

    public get setId(): string
    {
        return this._setId;
    }

    public get defaultCollectionName(): string
    {
        return this._defaultCollectionName;
    }
}
