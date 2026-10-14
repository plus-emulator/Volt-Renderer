import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredLinkOpenParser } from '../../parser';

/** The the server asks to open a WIRED Link, package_82.class_3692 (in 1715 in WIN63-202610131318). */
export class WiredLinkOpenEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredLinkOpenParser);
    }

    public getParser(): WiredLinkOpenParser
    {
        return this.parser as WiredLinkOpenParser;
    }
}
