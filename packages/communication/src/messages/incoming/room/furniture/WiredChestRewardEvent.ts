import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { WiredChestRewardMessageParser } from '../../../parser';

export class WiredChestRewardEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredChestRewardMessageParser);
    }

    public getParser(): WiredChestRewardMessageParser
    {
        return this.parser as WiredChestRewardMessageParser;
    }
}
