import { IMessageComposer } from '@volt/api';

/**
 * The monitor tab's request for the room statistics (AIR WIN63-202610121709-785561319
 * outgoing/userdefinedroomevents/wiredmenu/class_3333.as). It has no body.
 */
export class WiredGetRoomStatsComposer implements IMessageComposer<[]>
{
    public getMessageArray(): []
    {
        return [];
    }

    public dispose(): void
    { }
}
