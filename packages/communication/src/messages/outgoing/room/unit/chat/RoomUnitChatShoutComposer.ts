import { IMessageComposer } from '@volt/api';

// AIR WIN63-202610151745-318700621 package_76/class_2972.as:13: text, style.
export class RoomUnitChatShoutComposer implements IMessageComposer<ConstructorParameters<typeof RoomUnitChatShoutComposer>>
{
    private _data: ConstructorParameters<typeof RoomUnitChatShoutComposer>;

    constructor(message: string, styleId: number = 0)
    {
        this._data = [message, styleId];
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
