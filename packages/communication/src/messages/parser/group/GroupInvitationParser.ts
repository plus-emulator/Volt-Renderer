import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** A group owner invites the user to join a group. */
export class GroupInvitationParser implements IMessageParser
{
    private _groupId: number;
    private _groupName: string;
    private _badgeCode: string;
    private _roomId: number;

    public flush(): boolean
    {
        this._groupId = 0;
        this._groupName = null;
        this._badgeCode = null;
        this._roomId = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._groupId = wrapper.readInt();
        this._groupName = wrapper.readString();
        this._badgeCode = wrapper.readString();
        this._roomId = wrapper.readInt();

        return true;
    }

    public get groupId(): number
    {
        return this._groupId;
    }

    public get groupName(): string
    {
        return this._groupName;
    }

    public get badgeCode(): string
    {
        return this._badgeCode;
    }

    /** The room the invitation came from, 0 when none. */
    public get roomId(): number
    {
        return this._roomId;
    }
}
