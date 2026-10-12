import { IMessageDataWrapper, IMessageParser } from '@volt/api';

export class FriendNotificationParser implements IMessageParser
{
    private _typeCode: number;
    private _avatarId: number;
    private _message: string;

    public flush(): boolean
    {
        this._typeCode = -1;
        this._avatarId = 0;
        this._message = null;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        // AIR (WIN63-202609161723-93809945): string avatarId, int typeCode, string message.
        this._avatarId = parseInt(wrapper.readString(), 10);
        this._typeCode = wrapper.readInt();
        this._message = wrapper.readString();

        return true;
    }

    public get typeCode(): number
    {
        return this._typeCode;
    }

    public get avatarId(): number
    {
        return this._avatarId;
    }

    public get message(): string
    {
        return this._message;
    }
}
