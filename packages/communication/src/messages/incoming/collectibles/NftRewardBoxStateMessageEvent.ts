import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { NftRewardBoxStateMessageParser } from '../../parser';

export class NftRewardBoxStateMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, NftRewardBoxStateMessageParser);
    }

    public getParser(): NftRewardBoxStateMessageParser
    {
        return this.parser as NftRewardBoxStateMessageParser;
    }
}
