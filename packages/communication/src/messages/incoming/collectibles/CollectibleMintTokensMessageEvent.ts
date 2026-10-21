import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { CollectibleMintTokensMessageParser } from '../../parser';

export class CollectibleMintTokensMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, CollectibleMintTokensMessageParser);
    }

    public getParser(): CollectibleMintTokensMessageParser
    {
        return this.parser as CollectibleMintTokensMessageParser;
    }
}
