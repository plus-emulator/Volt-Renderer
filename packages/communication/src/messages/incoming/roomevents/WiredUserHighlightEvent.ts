import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredUserHighlightParser } from '../../parser';

/** The set user highlight, class_3603 (in 1684 in WIN63-202610131318). */
export class WiredUserHighlightEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredUserHighlightParser);
    }

    public getParser(): WiredUserHighlightParser
    {
        return this.parser as WiredUserHighlightParser;
    }
}
