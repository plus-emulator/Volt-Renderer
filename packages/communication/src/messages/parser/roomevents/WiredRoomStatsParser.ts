import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/**
 * The monitor tab's room statistics (AIR WIN63-202610121709-785561319 package_121/WiredRoomStatsData.as): execution cost and its
 * cap as doubles, the heavy flag, then floor furni, wall furni and the permanent furni, user and global variables as count/cap pairs.
 */
export class WiredRoomStatsParser implements IMessageParser
{
    private _executionCost = 0;
    private _executionCostCap = 0;
    private _isHeavy = false;
    private _floorItemCount = 0;
    private _floorItemCap = 0;
    private _wallItemCount = 0;
    private _wallItemCap = 0;
    private _permanentFurniVariables = 0;
    private _maxPermanentFurniVariables = 0;
    private _permanentUserVariables = 0;
    private _maxPermanentUserVariables = 0;
    private _permanentGlobalVariables = 0;
    private _maxPermanentGlobalVariables = 0;

    public flush(): boolean
    {
        this._executionCost = 0;
        this._executionCostCap = 0;
        this._isHeavy = false;
        this._floorItemCount = 0;
        this._floorItemCap = 0;
        this._wallItemCount = 0;
        this._wallItemCap = 0;
        this._permanentFurniVariables = 0;
        this._maxPermanentFurniVariables = 0;
        this._permanentUserVariables = 0;
        this._maxPermanentUserVariables = 0;
        this._permanentGlobalVariables = 0;
        this._maxPermanentGlobalVariables = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._executionCost = wrapper.readDouble();
        this._executionCostCap = wrapper.readDouble();
        this._isHeavy = wrapper.readBoolean();
        this._floorItemCount = wrapper.readInt();
        this._floorItemCap = wrapper.readInt();
        this._wallItemCount = wrapper.readInt();
        this._wallItemCap = wrapper.readInt();
        this._permanentFurniVariables = wrapper.readInt();
        this._maxPermanentFurniVariables = wrapper.readInt();
        this._permanentUserVariables = wrapper.readInt();
        this._maxPermanentUserVariables = wrapper.readInt();
        this._permanentGlobalVariables = wrapper.readInt();
        this._maxPermanentGlobalVariables = wrapper.readInt();

        return true;
    }

    public get executionCost(): number
    {
        return this._executionCost;
    }

    public get executionCostCap(): number
    {
        return this._executionCostCap;
    }

    public get isHeavy(): boolean
    {
        return this._isHeavy;
    }

    public get floorItemCount(): number
    {
        return this._floorItemCount;
    }

    public get floorItemCap(): number
    {
        return this._floorItemCap;
    }

    public get wallItemCount(): number
    {
        return this._wallItemCount;
    }

    public get wallItemCap(): number
    {
        return this._wallItemCap;
    }

    public get permanentFurniVariables(): number
    {
        return this._permanentFurniVariables;
    }

    public get maxPermanentFurniVariables(): number
    {
        return this._maxPermanentFurniVariables;
    }

    public get permanentUserVariables(): number
    {
        return this._permanentUserVariables;
    }

    public get maxPermanentUserVariables(): number
    {
        return this._maxPermanentUserVariables;
    }

    public get permanentGlobalVariables(): number
    {
        return this._permanentGlobalVariables;
    }

    public get maxPermanentGlobalVariables(): number
    {
        return this._maxPermanentGlobalVariables;
    }
}
