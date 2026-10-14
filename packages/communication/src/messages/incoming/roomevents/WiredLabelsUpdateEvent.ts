import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredLabelsUpdateParser } from '../../parser';

/** The labels and regions added, changed or removed, class_2856 (in 796 in WIN63-202610131318). */
export class WiredLabelsUpdateEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredLabelsUpdateParser);
    }

    public getParser(): WiredLabelsUpdateParser
    {
        return this.parser as WiredLabelsUpdateParser;
    }
}
