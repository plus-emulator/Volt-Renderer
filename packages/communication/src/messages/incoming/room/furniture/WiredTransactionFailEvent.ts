import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredTransactionFailMessageParser } from '../../../parser';

export class WiredTransactionFailEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredTransactionFailMessageParser);
    }

    public getParser(): WiredTransactionFailMessageParser
    {
        return this.parser as WiredTransactionFailMessageParser;
    }
}
