import { IMessageComposer } from '@volt/api';

// AIR WIN63-202610151745-318700621 package_76/class_2237.as:15: text, style, chat tracking id.
export class RoomUnitChatComposer implements IMessageComposer<ConstructorParameters<typeof RoomUnitChatComposer>>
{
    private _data: ConstructorParameters<typeof RoomUnitChatComposer>;

    constructor(message: string, styleId: number = 0, trackingId: number = -1)
    {
        this._data = [message, styleId, trackingId];
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
