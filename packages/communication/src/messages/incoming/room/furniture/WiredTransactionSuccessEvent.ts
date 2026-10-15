import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredTransactionSuccessMessageParser } from '../../../parser';

export class WiredTransactionSuccessEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredTransactionSuccessMessageParser);
    }

    public getParser(): WiredTransactionSuccessMessageParser
    {
        return this.parser as WiredTransactionSuccessMessageParser;
    }
}
