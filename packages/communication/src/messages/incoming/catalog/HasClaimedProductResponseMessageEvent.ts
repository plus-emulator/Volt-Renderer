import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { HasClaimedProductResponseMessageParser } from '../../parser';

export class HasClaimedProductResponseMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, HasClaimedProductResponseMessageParser);
    }

    public getParser(): HasClaimedProductResponseMessageParser
    {
        return this.parser as HasClaimedProductResponseMessageParser;
    }
}
