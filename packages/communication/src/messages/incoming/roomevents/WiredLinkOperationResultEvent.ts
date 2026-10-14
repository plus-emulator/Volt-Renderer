import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredLinkOperationResultParser } from '../../parser';

/** The the result of a WIRED Link operation, package_82.class_3722 (in 3961 in WIN63-202610131318). */
export class WiredLinkOperationResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredLinkOperationResultParser);
    }

    public getParser(): WiredLinkOperationResultParser
    {
        return this.parser as WiredLinkOperationResultParser;
    }
}
