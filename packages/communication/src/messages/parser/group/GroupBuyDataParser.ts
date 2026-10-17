import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { GroupDataBadgePart } from './utils';

// AIR WIN63-202610151745-318700621 package_37/class_3515.as:24 (data: package_9/class_2068.as).
export class GroupBuyDataParser implements IMessageParser
{
    private _groupCost: number;
    private _availableRooms: Map<number, string>;
    private _badgeParts: GroupDataBadgePart[];

    flush(): boolean
    {
        this._groupCost = 0;
        this._availableRooms = new Map();
        this._badgeParts = [];

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._groupCost = wrapper.readInt();
        let availableRoomsCount = wrapper.readInt();

        while(availableRoomsCount > 0)
        {
            const roomId = wrapper.readInt();
            const roomName = wrapper.readString();
            wrapper.readBoolean();

            this._availableRooms.set(roomId, roomName);

            availableRoomsCount--;
        }

        let badgePartsCount = wrapper.readInt();

        while(badgePartsCount > 0)
        {
            const part = new GroupDataBadgePart(this._badgeParts.length === 0);

            part.key = wrapper.readInt();
            part.color = wrapper.readInt();
            part.position = wrapper.readInt();

            this._badgeParts.push(part);

            badgePartsCount--;
        }

        return true;
    }

    public get groupCost(): number
    {
        return this._groupCost;
    }

    public get availableRooms(): Map<number, string>
    {
        return this._availableRooms;
    }

    public get badgeParts(): GroupDataBadgePart[]
    {
        return this._badgeParts;
    }
}
