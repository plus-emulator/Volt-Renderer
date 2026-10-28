import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredMenuErrorParser } from '../../parser';

export class WiredMenuErrorEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredMenuErrorParser);
    }

    public getParser(): WiredMenuErrorParser
    {
        return this.parser as WiredMenuErrorParser;
    }
}
