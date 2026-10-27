import { IMessageComposer } from '@volt/api';

/**
 * The monitor tab's "Clear all" button (AIR WIN63-202610201032-107964540
 * outgoing/userdefinedroomevents/wiredmenu/class_3251.as). It has no body.
 */
export class WiredClearErrorLogsComposer implements IMessageComposer<[]>
{
    public getMessageArray(): []
    {
        return [];
    }

    public dispose(): void
    { }
}
