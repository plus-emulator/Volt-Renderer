import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { NftTransferFeeMessageParser } from '../../parser';

export class NftTransferFeeMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, NftTransferFeeMessageParser);
    }

    public getParser(): NftTransferFeeMessageParser
    {
        return this.parser as NftTransferFeeMessageParser;
    }
}
