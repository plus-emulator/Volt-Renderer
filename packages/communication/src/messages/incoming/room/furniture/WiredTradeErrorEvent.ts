import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredTradeErrorMessageParser } from '../../../parser';

export class WiredTradeErrorEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredTradeErrorMessageParser);
    }

    public getParser(): WiredTradeErrorMessageParser
    {
        return this.parser as WiredTradeErrorMessageParser;
    }
}
