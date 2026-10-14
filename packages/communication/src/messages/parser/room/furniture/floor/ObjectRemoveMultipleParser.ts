import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/**
 * October `class_2976` (`ObjectRemoveMultiple`, 2197): `int count [ int id ]
 * int pickerId, boolean byInvisibleFurniManager`. The handler disposes every floor
 * object and refreshes the tile object map once.
 */
export class ObjectRemoveMultipleParser implements IMessageParser
{
    private _ids: number[];
    private _pickerId: number;
    private _byInvisibleFurniManager: boolean;

    public flush(): boolean
    {
        this._ids = [];
        this._pickerId = 0;
        this._byInvisibleFurniManager = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._ids = [];

        let totalIds = wrapper.readInt();

        while(totalIds > 0)
        {
            this._ids.push(wrapper.readInt());

            totalIds--;
        }

        this._pickerId = wrapper.readInt();
        this._byInvisibleFurniManager = wrapper.readBoolean();

        return true;
    }

    public get ids(): number[]
    {
        return this._ids;
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
