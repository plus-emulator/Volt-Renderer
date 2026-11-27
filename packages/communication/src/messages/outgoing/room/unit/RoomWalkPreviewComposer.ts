import { IMessageComposer } from '@volt/api';

export class RoomWalkPreviewComposer implements IMessageComposer<ConstructorParameters<typeof RoomWalkPreviewComposer>>
{
    private _data: ConstructorParameters<typeof RoomWalkPreviewComposer>;

    constructor(requestId: number, roomId: number, x: number, y: number)
    {
        this._data = [requestId, roomId, x, y];
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
