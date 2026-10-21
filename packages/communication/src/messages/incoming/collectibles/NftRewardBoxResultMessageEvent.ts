import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { NftRewardBoxResultMessageParser } from '../../parser';

export class NftRewardBoxResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, NftRewardBoxResultMessageParser);
    }

    public getParser(): NftRewardBoxResultMessageParser
    {
        return this.parser as NftRewardBoxResultMessageParser;
    }
}
