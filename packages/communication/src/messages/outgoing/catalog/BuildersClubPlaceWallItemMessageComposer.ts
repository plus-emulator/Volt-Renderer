import { IMessageComposer } from '@volt/api';

/**
 * Places a Builders Club wall item (AIR WIN63-202610151745-318700621 package_16/class_1795.as:11). The infostand sends
 * pageId -1. The trailing boolean is set when the placement is sent again after BuildersClubPlacementWarning was confirmed
 * (room/class_2005.as:383-387).
 */
export class BuildersClubPlaceWallItemMessageComposer implements IMessageComposer<ConstructorParameters<typeof BuildersClubPlaceWallItemMessageComposer>>
{
    private _data: ConstructorParameters<typeof BuildersClubPlaceWallItemMessageComposer>;

    constructor(pageId: number, offerId: number, extraParam: string, wallLocation: string, confirmed: boolean = false)
    {
        this._data = [pageId, offerId, extraParam, wallLocation, confirmed];
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
