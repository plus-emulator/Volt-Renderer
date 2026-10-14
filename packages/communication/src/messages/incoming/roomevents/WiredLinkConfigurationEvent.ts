import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredLinkConfigurationParser } from '../../parser';

/** The a WIRED Link configuration, package_82.class_3192 (in 3405 in WIN63-202610131318). */
export class WiredLinkConfigurationEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredLinkConfigurationParser);
    }

    public getParser(): WiredLinkConfigurationParser
    {
        return this.parser as WiredLinkConfigurationParser;
    }
}
