import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { NftTransferResultMessageParser } from '../../parser';

export class NftTransferResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, NftTransferResultMessageParser);
    }

    public getParser(): NftTransferResultMessageParser
    {
        return this.parser as NftTransferResultMessageParser;
    }
}
