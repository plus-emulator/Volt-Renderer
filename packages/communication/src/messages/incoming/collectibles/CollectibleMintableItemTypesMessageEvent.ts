import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { CollectibleMintableItemTypesMessageParser } from '../../parser';

export class CollectibleMintableItemTypesMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, CollectibleMintableItemTypesMessageParser);
    }

    public getParser(): CollectibleMintableItemTypesMessageParser
    {
        return this.parser as CollectibleMintableItemTypesMessageParser;
    }
}
