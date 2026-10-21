import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_3949: a wallet's collector score and level. */
export class CollectorScoreMessageParser implements IMessageParser
{
    private _score: number = 0;
    private _highestScore: number = 0;
    private _level: number = 0;

    public flush(): boolean
    {
        this._score = 0;
        this._highestScore = 0;
        this._level = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._score = wrapper.readInt();
        this._highestScore = wrapper.readInt();
        this._level = wrapper.readInt();

        return true;
    }

    public get score(): number
    {
        return this._score;
    }

    public get highestScore(): number
    {
        return this._highestScore;
    }

    public get level(): number
    {
        return this._level;
    }
}
