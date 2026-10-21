import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { CollectibleWalletAddressesMessageParser } from '../../parser';

export class CollectibleWalletAddressesMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, CollectibleWalletAddressesMessageParser);
    }

    public getParser(): CollectibleWalletAddressesMessageParser
    {
        return this.parser as CollectibleWalletAddressesMessageParser;
    }
}
