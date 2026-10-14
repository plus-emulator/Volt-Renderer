import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { VariableLeaderboardChunkParser } from '../../parser';

/** The variable leaderboard rows, package_160.class_3168 (in 3979 in WIN63-202610131318). */
export class VariableLeaderboardChunkEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, VariableLeaderboardChunkParser);
    }

    public getParser(): VariableLeaderboardChunkParser
    {
        return this.parser as VariableLeaderboardChunkParser;
    }
}
