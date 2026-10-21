import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { NftClaimResultMessageParser } from '../../parser';

export class NftClaimResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, NftClaimResultMessageParser);
    }

    public getParser(): NftClaimResultMessageParser
    {
        return this.parser as NftClaimResultMessageParser;
    }
}
