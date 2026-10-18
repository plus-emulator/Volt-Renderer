import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/**
 * AIR WIN63-202610151745-318700621 package_174/class_3882.as:36-41. Result codes follow the texts
 * claim_product.result.N: 0 claimed, 1 already claimed, 2 claim not found, 3 claim not active, 4 claim failed.
 */
export class ClaimProductResultMessageParser implements IMessageParser
{
    public static RESULT_CLAIMED: number = 0;
    public static RESULT_ALREADY_CLAIMED: number = 1;
    public static RESULT_NOT_FOUND: number = 2;
    public static RESULT_NOT_ACTIVE: number = 3;
    public static RESULT_FAILED: number = 4;

    private _claimId: string;
    private _result: number;

    public flush(): boolean
    {
        this._claimId = null;
        this._result = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if (!wrapper) return false;

        this._claimId = wrapper.readString();
        this._result = wrapper.readInt();

        return true;
    }

    public get claimId(): string
    {
        return this._claimId;
    }

    public get result(): number
    {
        return this._result;
    }
}
