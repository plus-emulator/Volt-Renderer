import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredLinkNetworkInvalidatedParser } from '../../parser';

/** The a WIRED Link network was deleted, package_82.class_2356 (in 999 in WIN63-202610131318). */
export class WiredLinkNetworkInvalidatedEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredLinkNetworkInvalidatedParser);
    }

    public getParser(): WiredLinkNetworkInvalidatedParser
    {
        return this.parser as WiredLinkNetworkInvalidatedParser;
    }
}
