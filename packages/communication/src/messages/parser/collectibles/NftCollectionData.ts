import { IMessageDataWrapper } from '@volt/api';
import { DailyTaskData } from '../quest';
import { NftCollectionItemData } from './NftCollectionItemData';
import { NftItemClaimData } from './NftItemClaimData';

/** A collectible collection with the wallet's progress (AIR parser/collectibles/class_4381). */
export class NftCollectionData
{
    public static readonly CLAIMING_IDLE = 0;
    public static readonly CLAIMING_AWAITING = 1;

    private _items: NftCollectionItemData[];
    private _collectionId: string;
    private _collectionName: string;
    private _collectionScore: number;
    private _collectionTotalScore: number;
    private _collectionBoostScore: number;
    private _bonusItem: NftCollectionItemData = null;
    private _rewardItem: NftCollectionItemData = null;
    private _releasedTime: number;
    private _snapshotTime: number;
    private _status: number;
    private _bonusItemClaim: NftItemClaimData = null;
    private _rewardItemClaim: NftItemClaimData = null;
    private _collectedItemCount: number = 0;
    private _claimingBonusStatus: number = NftCollectionData.CLAIMING_IDLE;
    private _claimingRewardStatus: number = NftCollectionData.CLAIMING_IDLE;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._items = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const item = new NftCollectionItemData(wrapper);

            this._items.push(item);

            if(item.amount > 0) this._collectedItemCount++;
        }

        this._collectionId = wrapper.readString();
        this._collectionName = wrapper.readString();
        this._collectionScore = wrapper.readInt();
        this._collectionTotalScore = wrapper.readInt();
        this._collectionBoostScore = wrapper.readInt();

        const hasBonus = wrapper.readBoolean();

        if(hasBonus) this._bonusItem = new NftCollectionItemData(wrapper);

        const hasReward = wrapper.readBoolean();

        if(hasReward) this._rewardItem = new NftCollectionItemData(wrapper);

        this._releasedTime = DailyTaskData.readLong(wrapper);
        this._snapshotTime = DailyTaskData.readLong(wrapper);
        this._status = wrapper.readShort();

        if(hasBonus) this._bonusItemClaim = new NftItemClaimData(wrapper);

        if(hasReward) this._rewardItemClaim = new NftItemClaimData(wrapper);
    }

    public claimRewardAwaiting(): void
    {
        this._claimingRewardStatus = NftCollectionData.CLAIMING_AWAITING;
    }

    public claimBonusAwaiting(): void
    {
        this._claimingBonusStatus = NftCollectionData.CLAIMING_AWAITING;
    }

    public claimRewardFinished(success: boolean): void
    {
        this._claimingRewardStatus = NftCollectionData.CLAIMING_IDLE;

        if(success) this._rewardItemClaim.claimedAmount += 1;
    }

    public claimBonusFinished(success: boolean): void
    {
        this._claimingBonusStatus = NftCollectionData.CLAIMING_IDLE;

        if(success) this._bonusItemClaim.claimedAmount += 1;
    }

    public isBonusSnapshotPassed(): boolean
    {
        return this._snapshotTime < Date.now();
    }

    public get items(): NftCollectionItemData[]
    {
        return this._items;
    }

    public get collectionId(): string
    {
        return this._collectionId;
    }

    public get collectionName(): string
    {
        return this._collectionName;
    }

    public get collectionScore(): number
    {
        return this._collectionScore;
    }

    public get collectionTotalScore(): number
    {
        return this._collectionTotalScore;
    }

    public get collectionBoostScore(): number
    {
        return this._collectionBoostScore;
    }

    public get bonusItem(): NftCollectionItemData
    {
        return this._bonusItem;
    }

    public get rewardItem(): NftCollectionItemData
    {
        return this._rewardItem;
    }

    /** Milliseconds since the epoch, -1 when not set. */
    public get releasedTime(): number
    {
        return this._releasedTime;
    }

    /** Milliseconds since the epoch, -1 when not set. */
    public get snapshotTime(): number
    {
        return this._snapshotTime;
    }

    public get status(): number
    {
        return this._status;
    }

    public get bonusItemClaim(): NftItemClaimData
    {
        return this._bonusItemClaim;
    }

    public get rewardItemClaim(): NftItemClaimData
    {
        return this._rewardItemClaim;
    }

    public get collectedItemCount(): number
    {
        return this._collectedItemCount;
    }

    public get totalItemCount(): number
    {
        return this._items.length;
    }

    public get progressPercentage(): number
    {
        if(!this.totalItemCount) return 0;

        return Math.trunc((this._collectedItemCount * 100) / this.totalItemCount);
    }

    public get claimingBonusStatus(): number
    {
        return this._claimingBonusStatus;
    }

    public get claimingRewardStatus(): number
    {
        return this._claimingRewardStatus;
    }

    public get hasRewardItem(): boolean
    {
        return this._rewardItem !== null;
    }

    public get hasBonusItem(): boolean
    {
        return this._bonusItem !== null;
    }

    public get rewardClaimed(): boolean
    {
        const claim = this._rewardItemClaim;

        return this.hasRewardItem && claim !== null && (((claim.claimedAmount > 0) && (claim.claimedAmount >= claim.claimLimit)) || (this._claimingRewardStatus === NftCollectionData.CLAIMING_AWAITING));
    }

    public get bonusClaimed(): boolean
    {
        const claim = this._bonusItemClaim;

        return this.hasBonusItem && claim !== null && (((claim.claimedAmount > 0) && (claim.claimedAmount >= claim.claimLimit)) || (this._claimingBonusStatus !== NftCollectionData.CLAIMING_IDLE));
    }

    public get canClaimReward(): boolean
    {
        const claim = this._rewardItemClaim;

        return this.hasRewardItem && claim !== null && (claim.status === NftItemClaimData.STATUS_CLAIMABLE) && !this.rewardClaimed && (claim.claimedAmount < claim.claimLimit) && (this._claimingRewardStatus === NftCollectionData.CLAIMING_IDLE);
    }

    public get canClaimBonus(): boolean
    {
        const claim = this._bonusItemClaim;

        return this.hasBonusItem && claim !== null && (claim.status === NftItemClaimData.STATUS_CLAIMABLE) && !this.bonusClaimed && (claim.claimedAmount < claim.claimLimit) && (this._claimingBonusStatus === NftCollectionData.CLAIMING_IDLE);
    }
}
