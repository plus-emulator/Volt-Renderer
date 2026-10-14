import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredUserTransparencyParser } from '../../parser';

/** The set user transparency, class_2828 (in 3664 in WIN63-202610131318). */
export class WiredUserTransparencyEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredUserTransparencyParser);
    }

    public getParser(): WiredUserTransparencyParser
    {
        return this.parser as WiredUserTransparencyParser;
    }
}
