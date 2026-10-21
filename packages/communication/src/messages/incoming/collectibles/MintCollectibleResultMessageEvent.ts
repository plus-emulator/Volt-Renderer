import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { MintCollectibleResultMessageParser } from '../../parser';

export class MintCollectibleResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, MintCollectibleResultMessageParser);
    }

    public getParser(): MintCollectibleResultMessageParser
    {
        return this.parser as MintCollectibleResultMessageParser;
    }
}
