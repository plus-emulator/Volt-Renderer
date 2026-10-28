import { IMessageComposer } from '@volt/api';

/**
 * Chat preferences: a leading boolean the official client always sends as false, then chat mode
 * (0 free flow / 1 line by line), bubble width (0 wide / 1 normal / 2 thin) and scroll speed
 * (0 fast / 1 normal / 2 slow).
 */
export class UserSettingsChatPreferencesComposer implements IMessageComposer<[boolean, number, number, number]>
{
    private _data: [boolean, number, number, number];

    constructor(chatMode: number, chatBubbleWidth: number, chatScrollSpeed: number)
    {
        this._data = [ false, chatMode, chatBubbleWidth, chatScrollSpeed ];
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
