import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** One avatar collectible (AIR package_213/NftWardrobeItem.as:20). */
export interface INftWardrobeItem
{
    id: string;
    figureString: string;
    gender: string;
    tokenId: string;
    contractKey: string;
}

/** AIR package_213/class_4188.as:23: the user's avatar collectibles. */
export class UserNftWardrobeMessageParser implements IMessageParser
{
    private _nftAvatars: INftWardrobeItem[] = [];

    public flush(): boolean
    {
        this._nftAvatars = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        let count = wrapper.readInt();

        while(count > 0)
        {
            const id = wrapper.readString();
            const figureString = wrapper.readString();
            const gender = wrapper.readString();
            const tokenId = wrapper.readString();
            const contractKey = wrapper.readString();

            this._nftAvatars.push({ id, figureString, gender, tokenId, contractKey });

            count--;
        }

        return true;
    }

    public get nftAvatars(): INftWardrobeItem[]
    {
        return this._nftAvatars;
    }
}
