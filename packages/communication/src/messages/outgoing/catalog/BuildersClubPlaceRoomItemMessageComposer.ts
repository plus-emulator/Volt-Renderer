import { IMessageComposer } from '@volt/api';

/**
 * Places a Builders Club floor item (AIR WIN63-202610151745-318700621 package_16/class_2016.as:11). The infostand sends
 * pageId -1; no AIR caller sets the trailing boolean, which defaults to false.
 */
export class BuildersClubPlaceRoomItemMessageComposer implements IMessageComposer<ConstructorParameters<typeof BuildersClubPlaceRoomItemMessageComposer>>
{
    private _data: ConstructorParameters<typeof BuildersClubPlaceRoomItemMessageComposer>;

    constructor(pageId: number, offerId: number, extraParam: string, x: number, y: number, direction: number, flag: boolean = false)
    {
        this._data = [pageId, offerId, extraParam, x, y, direction, flag];
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
