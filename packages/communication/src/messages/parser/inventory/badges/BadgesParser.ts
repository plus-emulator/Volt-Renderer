import { IAdvancedMap, IMessageDataWrapper, IMessageParser } from '@volt/api';
import { AdvancedMap } from '@volt/utils';

/** One badge as the inventory badges packet carries it. */
export interface IBadgeDetail
{
    badgeId: number;
    badgeCode: string;
    ownerCount: number;
    badgeRarityId: number;
}

/**
 * AIR WIN63-202610151745-318700621 package_199/class_3484.as:48: total fragments, fragment index (0-based), then
 * per badge id, code, owner count and rarity id. Worn badges arrive in UserCurrentBadges for the own user id.
 */
export class BadgesParser implements IMessageParser
{
    private _totalFragments: number;
    private _fragmentNo: number;
    private _allBadgeCodes: string[];
    private _badgeIds: IAdvancedMap<string, number>;
    private _badgeDetails: IBadgeDetail[];

    public flush(): boolean
    {
        this._totalFragments = 0;
        this._fragmentNo = 0;
        this._allBadgeCodes = [];
        this._badgeIds = null;
        this._badgeDetails = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._totalFragments = wrapper.readInt();
        this._fragmentNo = wrapper.readInt();
        this._allBadgeCodes = [];
        this._badgeIds = new AdvancedMap();
        this._badgeDetails = [];

        let count = wrapper.readInt();

        while(count > 0)
        {
            const badgeId = wrapper.readInt();
            const badgeCode = wrapper.readString();
            const ownerCount = wrapper.readInt();
            const badgeRarityId = wrapper.readInt();

            this._badgeDetails.push({ badgeId, badgeCode, ownerCount, badgeRarityId });
            this._badgeIds.add(badgeCode, badgeId);
            this._allBadgeCodes.push(badgeCode);

            count--;
        }

        return true;
    }

    public get totalFragments(): number
    {
        return this._totalFragments;
    }

    public get fragmentNo(): number
    {
        return this._fragmentNo;
    }

    public getBadgeId(code: string): number
    {
        return this._badgeIds.getValue(code);
    }

    public getAllBadgeCodes(): string[]
    {
        return this._allBadgeCodes;
    }

    /** Owner count and rarity tier per badge, as the packet sent them. */
    public getBadgeDetails(): IBadgeDetail[]
    {
        return this._badgeDetails;
    }
}
