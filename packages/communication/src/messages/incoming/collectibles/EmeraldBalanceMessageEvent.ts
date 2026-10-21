import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { EmeraldBalanceMessageParser } from '../../parser';

export class EmeraldBalanceMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, EmeraldBalanceMessageParser);
    }

    public getParser(): EmeraldBalanceMessageParser
    {
        return this.parser as EmeraldBalanceMessageParser;
    }
}
