import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { ChestFurniStoredItemParser, IChestFurniStoredItem } from './ChestFurniStoredItemParser';

/**
 * The contents of an open furni chest changed: int chestId, int removedCount, int[] removedIds, int addedCount,
 * ChestStorage[]. AIR WIN63-202610121709 id 518 (package_112/class_3289).
 */
export class ChestFurniUpdateMessageParser implements IMessageParser
{
    private _chestId: number = 0;
    private _removedIds: number[] = [];
    private _added: IChestFurniStoredItem[] = [];

    public flush(): boolean
    {
        this._chestId = 0;
        this._removedIds = [];
        this._added = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this._chestId = wrapper.readInt();

        const removedCount = wrapper.readInt();
        this._removedIds = [];

        for(let i = 0; i < removedCount; i++)
        {
            this._removedIds.push(wrapper.readInt());
        }

        const addedCount = wrapper.readInt();
        this._added = [];

        for(let i = 0; i < addedCount; i++)
        {
            this._added.push(ChestFurniStoredItemParser.parse(wrapper));
        }

        return true;
    }

    public get chestId(): number
    {
        return this._chestId;
    }
    public get removedIds(): number[]
    {
        return this._removedIds;
    }
    public get added(): IChestFurniStoredItem[]
    {
        return this._added;
    }
}
