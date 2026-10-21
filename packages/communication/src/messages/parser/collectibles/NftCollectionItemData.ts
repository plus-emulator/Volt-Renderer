import { IMessageDataWrapper } from '@volt/api';
import { NftProductData } from './NftProductData';

/** A product of a collection with the amount the wallet owns (AIR parser/collectibles/class_4405). */
export class NftCollectionItemData extends NftProductData
{
    // The base constructor sets this through readAdditionalParams; a normal field initializer would reset it after super().
    private declare _amount: number;

    protected override readAdditionalParams(wrapper: IMessageDataWrapper): void
    {
        this._amount = wrapper.readInt();
    }

    public get amount(): number
    {
        return this._amount;
    }
}
