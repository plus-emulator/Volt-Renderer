import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { NftStoreOffersMessageParser } from '../../parser';

export class NftStoreOffersMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, NftStoreOffersMessageParser);
    }

    public getParser(): NftStoreOffersMessageParser
    {
        return this.parser as NftStoreOffersMessageParser;
    }
}
