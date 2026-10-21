import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { SilverBalanceMessageParser } from '../../parser';

export class SilverBalanceMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, SilverBalanceMessageParser);
    }

    public getParser(): SilverBalanceMessageParser
    {
        return this.parser as SilverBalanceMessageParser;
    }
}
