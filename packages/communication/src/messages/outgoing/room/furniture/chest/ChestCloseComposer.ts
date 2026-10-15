import { IMessageComposer } from '@volt/api';

/** The chest window was closed: [chestId]. AIR WIN63-202610121709 id 1154 (package_95/class_2979). */
export class ChestCloseComposer implements IMessageComposer<ConstructorParameters<typeof ChestCloseComposer>>
{
    private _data: ConstructorParameters<typeof ChestCloseComposer>;

    constructor(chestId: number)
    {
        this._data = [chestId];
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
