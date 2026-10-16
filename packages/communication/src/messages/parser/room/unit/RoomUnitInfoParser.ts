import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/**
 * UserChange (AIR WIN63-202610131318-860371703 incoming 625, class_2587.parse L67-90): id, figure, sex, motto,
 * achievement score, an unread string, n x (int, int, int), badges rank.
 */
export class RoomUnitInfoParser implements IMessageParser
{
    private _unitId: number;
    private _figure: string;
    private _gender: string;
    private _motto: string;
    private _achievementScore: number;
    private _badgesRank: number;

    public flush(): boolean
    {
        this._unitId = null;
        this._figure = null;
        this._gender = 'M';
        this._motto = null;
        this._achievementScore = 0;
        this._badgesRank = -1;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._unitId = wrapper.readInt();
        this._figure = wrapper.readString();
        this._gender = wrapper.readString().toLocaleUpperCase();
        this._motto = wrapper.readString();
        this._achievementScore = wrapper.readInt();
        wrapper.readString();

        const totalUnread = wrapper.readInt();

        for(let i = 0; i < totalUnread; i++)
        {
            wrapper.readInt();
            wrapper.readInt();
            wrapper.readInt();
        }

        this._badgesRank = wrapper.readInt();

        return true;
    }

    public get unitId(): number
    {
        return this._unitId;
    }

    public get figure(): string
    {
        return this._figure;
    }

    public get gender(): string
    {
        return this._gender;
    }

    public get motto(): string
    {
        return this._motto;
    }

    public get achievementScore(): number
    {
        return this._achievementScore;
    }

    public get badgesRank(): number
    {
        return this._badgesRank;
    }

}
