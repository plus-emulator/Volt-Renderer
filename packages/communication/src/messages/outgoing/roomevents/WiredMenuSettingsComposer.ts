import { IMessageComposer } from '@volt/api';

/**
 * Wired menu account preferences (WiredMenuController.sendPreferences):
 * menu button, inspect button, play-test mode, a reserved int (always 0), wired whisper disabled,
 * show all notifications and the ui style name.
 */
export class WiredMenuSettingsComposer implements IMessageComposer<[boolean, boolean, boolean, number, boolean, boolean, string]>
{
    private _data: [boolean, boolean, boolean, number, boolean, boolean, string];

    constructor(menuButton: boolean, inspectButton: boolean, playTestMode: boolean, wiredWhisperDisabled: boolean, showAllNotifications: boolean, uiStyle: string)
    {
        this._data = [ menuButton, inspectButton, playTestMode, 0, wiredWhisperDisabled, showAllNotifications, uiStyle ];
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
