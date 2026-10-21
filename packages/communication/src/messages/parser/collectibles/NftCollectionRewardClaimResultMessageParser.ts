import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_4205: the result of claiming a collection's reward item. */
export class NftCollectionRewardClaimResultMessageParser implements IMessageParser
{
    private _collectionId: string = '';
    private _walletAddress: string = '';
    private _success: boolean = false;

    public flush(): boolean
    {
        this._collectionId = '';
        this._walletAddress = '';
        this._success = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._collectionId = wrapper.readString();
        this._walletAddress = wrapper.readString();
        this._success = wrapper.readBoolean();

        return true;
    }

    public get collectionId(): string
    {
        return this._collectionId;
    }

    public get walletAddress(): string
    {
        return this._walletAddress;
    }

    public get success(): boolean
    {
        return this._success;
    }
}
