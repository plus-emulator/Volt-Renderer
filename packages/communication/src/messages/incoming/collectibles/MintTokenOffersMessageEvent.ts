import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { MintTokenOffersMessageParser } from '../../parser';

export class MintTokenOffersMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, MintTokenOffersMessageParser);
    }

    public getParser(): MintTokenOffersMessageParser
    {
        return this.parser as MintTokenOffersMessageParser;
    }
}
