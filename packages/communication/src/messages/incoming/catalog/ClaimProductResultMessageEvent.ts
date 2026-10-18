import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { ClaimProductResultMessageParser } from '../../parser';

export class ClaimProductResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, ClaimProductResultMessageParser);
    }

    public getParser(): ClaimProductResultMessageParser
    {
        return this.parser as ClaimProductResultMessageParser;
    }
}
