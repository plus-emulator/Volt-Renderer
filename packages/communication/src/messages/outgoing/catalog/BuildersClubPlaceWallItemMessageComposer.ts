import { IMessageComposer } from '@volt/api';

/**
 * Places a Builders Club wall item (AIR WIN63-202610151745-318700621 package_16/class_1795.as:11). The infostand sends
 * pageId -1; no AIR caller sets the trailing boolean, which defaults to false.
 */
export class BuildersClubPlaceWallItemMessageComposer implements IMessageComposer<ConstructorParameters<typeof BuildersClubPlaceWallItemMessageComposer>>
{
    private _data: ConstructorParameters<typeof BuildersClubPlaceWallItemMessageComposer>;

    constructor(pageId: number, offerId: number, extraParam: string, wallLocation: string, flag: boolean = false)
    {
        this._data = [pageId, offerId, extraParam, wallLocation, flag];
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
