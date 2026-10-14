import { IMessageComposer } from '@volt/api';

/** Room-open request (0, 0, "0", []) or the chunks an overlay shows, package_221.class_3707 (out 2833 in WIN63-202610131318). */
export class VariableLeaderboardSubscribeComposer implements IMessageComposer<unknown[]>
{
    private _data: unknown[];

    constructor(overlayInstanceId: number, queryRevision: number, selectedVariableId: string, chunkIndices: number[])
    {
        this._data = [ overlayInstanceId, queryRevision, selectedVariableId, chunkIndices.length, ...chunkIndices ];
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
