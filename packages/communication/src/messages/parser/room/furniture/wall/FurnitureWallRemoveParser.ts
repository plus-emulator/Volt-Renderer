import { IMessageDataWrapper, IMessageParser } from '@octane/api';

export class FurnitureWallRemoveParser implements IMessageParser
{
    private _itemId: number;
    private _userId: number;
    private _byInvisibleFurniManager: boolean;

    public flush(): boolean
    {
        this._itemId = 0;
        this._userId = 0;
        this._byInvisibleFurniManager = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._itemId = parseInt(wrapper.readString());
        this._userId = wrapper.readInt();
        this._byInvisibleFurniManager = wrapper.readBoolean();

        return true;
    }

    public get itemId(): number
    {
        return this._itemId;
    }

    public get userId(): number
    {
        return this._userId;
    }

    public get byInvisibleFurniManager(): boolean
    {
        return this._byInvisibleFurniManager;
    }
}
