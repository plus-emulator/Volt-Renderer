import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { NftStorePurchaseResultMessageParser } from '../../parser';

export class NftStorePurchaseResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, NftStorePurchaseResultMessageParser);
    }

    public getParser(): NftStorePurchaseResultMessageParser
    {
        return this.parser as NftStorePurchaseResultMessageParser;
    }
}
