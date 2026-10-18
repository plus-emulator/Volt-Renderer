import { IMessageComposer } from '@volt/api';

/**
 * Asks whether the user has claimed a free product (AIR WIN63-202610151745-318700621 package_143/class_3538.as:12).
 * Sent by the cursed dragon adoption window and by new-feature promos with a not_claimed auto-open condition.
 */
export class HasClaimedProductMessageComposer implements IMessageComposer<ConstructorParameters<typeof HasClaimedProductMessageComposer>>
{
    private _data: ConstructorParameters<typeof HasClaimedProductMessageComposer>;

    constructor(claimId: string)
    {
        this._data = [claimId];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
