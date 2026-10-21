import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { NftCollectionBonusClaimResultMessageParser } from '../../parser';

export class NftCollectionBonusClaimResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, NftCollectionBonusClaimResultMessageParser);
    }

    public getParser(): NftCollectionBonusClaimResultMessageParser
    {
        return this.parser as NftCollectionBonusClaimResultMessageParser;
    }
}
