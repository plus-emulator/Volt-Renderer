import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { CollectibleMintableItemData } from './CollectibleMintableItemData';

/** AIR parser/collectibles/class_4328: the furni and clothing types that can be minted. */
export class CollectibleMintableItemTypesMessageParser implements IMessageParser
{
    private _collectibleProductItems: CollectibleMintableItemData[] = [];

    public flush(): boolean
    {
        this._collectibleProductItems = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._collectibleProductItems = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._collectibleProductItems.push(new CollectibleMintableItemData(wrapper));

        return true;
    }

    public hasData(): boolean
    {
        return this._collectibleProductItems.length > 0;
    }

    public get collectibleProductItems(): CollectibleMintableItemData[]
    {
        return this._collectibleProductItems;
    }
}
