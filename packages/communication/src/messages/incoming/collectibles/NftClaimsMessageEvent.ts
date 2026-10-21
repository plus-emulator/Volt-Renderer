import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { NftClaimsMessageParser } from '../../parser';

export class NftClaimsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, NftClaimsMessageParser);
    }

    public getParser(): NftClaimsMessageParser
    {
        return this.parser as NftClaimsMessageParser;
    }
}
