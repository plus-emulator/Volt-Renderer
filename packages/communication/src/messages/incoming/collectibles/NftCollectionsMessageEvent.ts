import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { NftCollectionsMessageParser } from '../../parser';

export class NftCollectionsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, NftCollectionsMessageParser);
    }

    public getParser(): NftCollectionsMessageParser
    {
        return this.parser as NftCollectionsMessageParser;
    }
}
