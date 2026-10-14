import { IMessageComposer } from '@volt/api';

/** Explicit wall-only extension; positive entity IDs route independently of signed builtin identities. */
export class WiredVariableInspectionRequestComposer implements IMessageComposer<number[]>
{
    private _data: number[];

    constructor(requestId: number, roomId: number, entityId: number)
    {
        if(![requestId, roomId, entityId].every(value => Number.isInteger(value) && value > 0 && value <= 2147483647)) throw new RangeError('Inspection routing IDs must be positive int32 values.');
        this._data = [ 1, requestId, roomId, 1, entityId, 1 ];
    }

    public getMessageArray(): number[]
    {
        return this._data;
    }
    public dispose(): void
    { }
}
