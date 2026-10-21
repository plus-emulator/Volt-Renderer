import { IMessageDataWrapper } from '@volt/api';
import { DailyTaskData } from '../quest';
import { NftClaimItemData } from './NftClaimItemData';

/** A collector reward claim (AIR parser/collectibles/class_4380). Times are milliseconds since the epoch. */
export class NftClaimData
{
    private _claimId: string;
    private _status: number;
    private _claimedAmount: number;
    private _claimLimit: number;
    private _validFrom: number;
    private _validTo: number;
    private _createdAt: number;
    private _updatedAt: number;
    private _collection: string;
    private _productCode: string;
    private _wallet: string;
    private _claimItem: NftClaimItemData;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._claimId = wrapper.readString();
        this._status = wrapper.readInt();
        this._claimedAmount = wrapper.readInt();
        this._claimLimit = wrapper.readInt();
        this._validFrom = DailyTaskData.readLong(wrapper);
        this._validTo = DailyTaskData.readLong(wrapper);
        this._createdAt = DailyTaskData.readLong(wrapper);
        this._updatedAt = DailyTaskData.readLong(wrapper);
        this._collection = wrapper.readString();
        this._productCode = wrapper.readString();
        this._wallet = wrapper.readString();
        this._claimItem = new NftClaimItemData(wrapper);
    }

    public get claimId(): string
    {
        return this._claimId;
    }

    public get status(): number
    {
        return this._status;
    }

    public get claimedAmount(): number
    {
        return this._claimedAmount;
    }

    public get claimLimit(): number
    {
        return this._claimLimit;
    }

    public get validFrom(): number
    {
        return this._validFrom;
    }

    public get validTo(): number
    {
        return this._validTo;
    }

    public get createdAt(): number
    {
        return this._createdAt;
    }

    public get updatedAt(): number
    {
        return this._updatedAt;
    }

    public get collection(): string
    {
        return this._collection;
    }

    public get productCode(): string
    {
        return this._productCode;
    }

    public get wallet(): string
    {
        return this._wallet;
    }

    public get claimItem(): NftClaimItemData
    {
        return this._claimItem;
    }
}
