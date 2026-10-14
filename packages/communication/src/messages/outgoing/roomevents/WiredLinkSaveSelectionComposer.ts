import { IMessageComposer } from '@volt/api';

/** Joins a WIRED Link to a network ("0" leaves it), package_129.class_2533 (out 385 in WIN63-202610131318). */
export class WiredLinkSaveSelectionComposer implements IMessageComposer<ConstructorParameters<typeof WiredLinkSaveSelectionComposer>>
{
    private _data: ConstructorParameters<typeof WiredLinkSaveSelectionComposer>;

    constructor(furniId: number, networkId: string, receiveLocal: boolean)
    {
        this._data = [ furniId, networkId, receiveLocal ];
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
