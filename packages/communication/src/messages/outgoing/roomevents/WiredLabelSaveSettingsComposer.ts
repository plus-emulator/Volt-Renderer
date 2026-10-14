import { IMessageComposer } from '@volt/api';

/** Saves the colour, visibility and always-open flag of a WIRED Label, class_3219 (out 2970 in WIN63-202610131318). */
export class WiredLabelSaveSettingsComposer implements IMessageComposer<ConstructorParameters<typeof WiredLabelSaveSettingsComposer>>
{
    private _data: ConstructorParameters<typeof WiredLabelSaveSettingsComposer>;

    constructor(furniId: number, bubbleColor: number, visibility: number, alwaysOpen: boolean)
    {
        this._data = [ furniId, bubbleColor, visibility, alwaysOpen ];
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
