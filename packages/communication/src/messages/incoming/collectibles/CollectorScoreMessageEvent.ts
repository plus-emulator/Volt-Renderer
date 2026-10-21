import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { CollectorScoreMessageParser } from '../../parser';

export class CollectorScoreMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, CollectorScoreMessageParser);
    }

    public getParser(): CollectorScoreMessageParser
    {
        return this.parser as CollectorScoreMessageParser;
    }
}
