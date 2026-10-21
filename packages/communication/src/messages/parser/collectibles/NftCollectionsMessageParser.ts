import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { NftCollectionData } from './NftCollectionData';

/** AIR parser/collectibles/class_3936: the collections with a wallet's progress. */
export class NftCollectionsMessageParser implements IMessageParser
{
    private _nftCollections: NftCollectionData[] = [];

    public flush(): boolean
    {
        this._nftCollections = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._nftCollections = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._nftCollections.push(new NftCollectionData(wrapper));

        return true;
    }

    public get nftCollections(): NftCollectionData[]
    {
        return this._nftCollections;
    }
}
