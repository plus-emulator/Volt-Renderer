import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR WIN63-202610151745-318700621 package_199/class_3694.as:28. */
export class BadgeReceivedParser implements IMessageParser
{
    private _badgeId: number;
    private _badgeCode: string;
    private _ownerCount: number;
    private _badgeRarityId: number;

    public flush(): boolean
    {
        this._badgeId = 0;
        this._badgeCode = null;
        this._ownerCount = 0;
        this._badgeRarityId = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._badgeId = wrapper.readInt();
        this._badgeCode = wrapper.readString();
        this._ownerCount = wrapper.readInt();
        this._badgeRarityId = wrapper.readInt();

        return true;
    }

    public get badgeId(): number
    {
        return this._badgeId;
    }

    public get badgeCode(): string
    {
        return this._badgeCode;
    }

    public get ownerCount(): number
    {
        return this._ownerCount;
    }

    public get badgeRarityId(): number
    {
        return this._badgeRarityId;
    }
}
