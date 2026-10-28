import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredTransactionLogListMessageParser } from '../../../parser';

export class WiredTransactionLogListEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredTransactionLogListMessageParser);
    }

    public getParser(): WiredTransactionLogListMessageParser
    {
        return this.parser as WiredTransactionLogListMessageParser;
    }
}
