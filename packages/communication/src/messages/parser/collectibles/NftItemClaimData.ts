import { IMessageDataWrapper } from '@volt/api';

/** The claim state of a collection's bonus or reward item (AIR parser/collectibles/CollectibleItemClaim). */
export class NftItemClaimData
{
    public static readonly STATUS_CLAIMABLE = 0;

    private _claimId: string;
    private _claimedAmount: number;
    private _claimLimit: number;
    private _status: number;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._claimId = wrapper.readString();
        this._claimedAmount = wrapper.readInt();
        this._claimLimit = wrapper.readInt();
        this._status = wrapper.readShort();
    }

    public get claimId(): string
    {
        return this._claimId;
    }

    public get claimedAmount(): number
    {
        return this._claimedAmount;
    }

    public set claimedAmount(value: number)
    {
        this._claimedAmount = value;
    }

    public get claimLimit(): number
    {
        return this._claimLimit;
    }

    public get status(): number
    {
        return this._status;
    }
}
