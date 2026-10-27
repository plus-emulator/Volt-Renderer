import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredErrorLogsParser } from '../../parser';

export class WiredErrorLogsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredErrorLogsParser);
    }

    public getParser(): WiredErrorLogsParser
    {
        return this.parser as WiredErrorLogsParser;
    }
}
