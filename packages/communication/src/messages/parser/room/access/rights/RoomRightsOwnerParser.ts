import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** YouAreOwner (AIR WIN63-202610131318-860371703 incoming 2031, class_4114.parse L27-30): flat id. */
export class RoomRightsOwnerParser implements IMessageParser
{
    private _roomId: number = 0;

    public flush(): boolean
    {
        this._roomId = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();

        return true;
    }

    public get roomId(): number
    {
        return this._roomId;
    }
}
