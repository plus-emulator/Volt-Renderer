import { IMessageComposer } from '@volt/api';

/** Synchronize button of the variable share add-on, class_3048 (out 2144 in WIN63-202610131318). */
export class WiredVariableShareSynchronizeComposer implements IMessageComposer<ConstructorParameters<typeof WiredVariableShareSynchronizeComposer>>
{
    private _data: ConstructorParameters<typeof WiredVariableShareSynchronizeComposer>;

    constructor(wiredId: number)
    {
        this._data = [ wiredId ];
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
