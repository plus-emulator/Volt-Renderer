import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredLinkConnectionsParser } from '../../parser';

/** The the connections of a WIRED Link network, package_82.class_2742 (in 3962 in WIN63-202610131318). */
export class WiredLinkConnectionsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredLinkConnectionsParser);
    }

    public getParser(): WiredLinkConnectionsParser
    {
        return this.parser as WiredLinkConnectionsParser;
    }
}
