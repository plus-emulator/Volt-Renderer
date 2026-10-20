import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredRoomStatsParser } from '../../parser';

export class WiredRoomStatsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredRoomStatsParser);
    }

    public getParser(): WiredRoomStatsParser
    {
        return this.parser as WiredRoomStatsParser;
    }
}
