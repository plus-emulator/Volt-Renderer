import { IMessageComposer } from '@volt/api';

/**
 * Places a Builders Club floor item (AIR WIN63-202610151745-318700621 package_16/class_2016.as:11). The infostand sends
 * pageId -1. The trailing boolean is set when the placement is sent again after BuildersClubPlacementWarning was confirmed
 * (room/class_2005.as:383-387).
 */
export class BuildersClubPlaceRoomItemMessageComposer implements IMessageComposer<ConstructorParameters<typeof BuildersClubPlaceRoomItemMessageComposer>>
{
    private _data: ConstructorParameters<typeof BuildersClubPlaceRoomItemMessageComposer>;

    constructor(pageId: number, offerId: number, extraParam: string, x: number, y: number, direction: number, confirmed: boolean = false)
    {
        this._data = [pageId, offerId, extraParam, x, y, direction, confirmed];
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
