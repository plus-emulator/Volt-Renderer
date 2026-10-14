import { IMessageComposer } from '@volt/api';

/** Saves the text of a WIRED Label, class_2797 (out 2638 in WIN63-202610131318). */
export class WiredLabelSaveTextComposer implements IMessageComposer<ConstructorParameters<typeof WiredLabelSaveTextComposer>>
{
    private _data: ConstructorParameters<typeof WiredLabelSaveTextComposer>;

    constructor(furniId: number, text: string)
    {
        this._data = [ furniId, text ];
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
