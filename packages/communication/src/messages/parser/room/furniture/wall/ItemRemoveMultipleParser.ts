import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/**
 * October `class_3121` (`ItemRemoveMultiple`, 3839): `int count [ int itemId ]
 * int pickerId, boolean byInvisibleFurniManager`, the wall-item twin of `ObjectRemoveMultiple`.
 */
export class ItemRemoveMultipleParser implements IMessageParser
{
    private _itemIds: number[];
    private _pickerId: number;
    private _byInvisibleFurniManager: boolean;

    public flush(): boolean
    {
        this._itemIds = [];
        this._pickerId = 0;
        this._byInvisibleFurniManager = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._itemIds = [];

        let totalItems = wrapper.readInt();

        while(totalItems > 0)
        {
            this._itemIds.push(wrapper.readInt());

            totalItems--;
        }

        this._pickerId = wrapper.readInt();
        this._byInvisibleFurniManager = wrapper.readBoolean();

        return true;
    }

    public get itemIds(): number[]
    {
        return this._itemIds;
    }

    public get pickerId(): number
    {
        return this._pickerId;
    }

    public get byInvisibleFurniManager(): boolean
    {
        return this._byInvisibleFurniManager;
    }
}
