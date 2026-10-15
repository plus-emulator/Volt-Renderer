import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { ChestFurniStoredItemParser, IChestFurniStoredItem } from './ChestFurniStoredItemParser';

/**
 * One fragment of a furni chest's contents: int chestId, int totalFragments, int fragmentNo, int count, ChestStorage[].
 * AIR WIN63-202610121709 id 44 (package_112/class_2610). Fragment 0 resets the list; the last fragment opens the chest.
 */
export class ChestFurniChunkMessageParser implements IMessageParser
{
    private _chestId: number = 0;
    private _totalFragments: number = 0;
    private _fragmentNo: number = 0;
    private _items: IChestFurniStoredItem[] = [];

    public flush(): boolean
    {
        this._chestId = 0;
        this._totalFragments = 0;
        this._fragmentNo = 0;
        this._items = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this._chestId = wrapper.readInt();
        this._totalFragments = wrapper.readInt();
        this._fragmentNo = wrapper.readInt();

        const count = wrapper.readInt();
        this._items = [];

        for(let i = 0; i < count; i++)
        {
            this._items.push(ChestFurniStoredItemParser.parse(wrapper));
        }

        return true;
    }

    public get chestId(): number
    {
        return this._chestId;
    }
    public get totalFragments(): number
    {
        return this._totalFragments;
    }
    public get fragmentNo(): number
    {
        return this._fragmentNo;
    }
    public get items(): IChestFurniStoredItem[]
    {
        return this._items;
    }
}
