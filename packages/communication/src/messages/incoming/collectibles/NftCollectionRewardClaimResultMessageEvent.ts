import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { NftCollectionRewardClaimResultMessageParser } from '../../parser';

export class NftCollectionRewardClaimResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, NftCollectionRewardClaimResultMessageParser);
    }

    public getParser(): NftCollectionRewardClaimResultMessageParser
    {
        return this.parser as NftCollectionRewardClaimResultMessageParser;
    }
}
