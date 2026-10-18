import { IMessageDataWrapper, IMessageParser } from '@volt/api';

// AIR WIN63-202610151745-318700621 package_174/class_2885.as:36-41
export class HasClaimedProductResponseMessageParser implements IMessageParser
{
    private _claimId: string;
    private _hasClaimed: boolean;

    public flush(): boolean
    {
        this._claimId = null;
        this._hasClaimed = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if (!wrapper) return false;

        this._claimId = wrapper.readString();
        this._hasClaimed = wrapper.readBoolean();

        return true;
    }

    public get claimId(): string
    {
        return this._claimId;
    }

    public get hasClaimed(): boolean
    {
        return this._hasClaimed;
    }
}
