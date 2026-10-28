import { IMessageComposer } from '@volt/api';

/**
 * The monitor tab's request for the room's Wired error rows (AIR WIN63-202610201032-107964540
 * outgoing/userdefinedroomevents/wiredmenu/class_2587.as). It has no body.
 */
export class WiredGetErrorLogsComposer implements IMessageComposer<[]>
{
    public getMessageArray(): []
    {
        return [];
    }

    public dispose(): void
    { }
}
