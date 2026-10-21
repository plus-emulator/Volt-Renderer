import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { CollectibleMintingEnabledMessageParser } from '../../parser';

export class CollectibleMintingEnabledMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, CollectibleMintingEnabledMessageParser);
    }

    public getParser(): CollectibleMintingEnabledMessageParser
    {
        return this.parser as CollectibleMintingEnabledMessageParser;
    }
}
