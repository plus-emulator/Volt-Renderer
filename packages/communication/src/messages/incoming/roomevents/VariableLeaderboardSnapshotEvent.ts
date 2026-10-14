import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { VariableLeaderboardSnapshotParser } from '../../parser';

/** The variable leaderboard descriptors, package_160.class_3569 (in 1494 in WIN63-202610131318). */
export class VariableLeaderboardSnapshotEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, VariableLeaderboardSnapshotParser);
    }

    public getParser(): VariableLeaderboardSnapshotParser
    {
        return this.parser as VariableLeaderboardSnapshotParser;
    }
}
