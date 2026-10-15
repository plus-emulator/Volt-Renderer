import { IMessageComposer } from '@volt/api';

/**
 * Open a wired chest and ask for its contents: [chestId]. AIR WIN63-202610121709 id 1595 (package_95/class_2544,
 * sent by WiredChestController.open after the server's ChestOpen 3966). The answer is ChestCoins (988) for a coin
 * chest or ChestFurniChunk (44) fragments for a furni chest.
 */
export class ChestOpenComposer implements IMessageComposer<ConstructorParameters<typeof ChestOpenComposer>>
{
    private _data: ConstructorParameters<typeof ChestOpenComposer>;

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
