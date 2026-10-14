import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredLabelsParser } from '../../parser';

/** The every label and region of the room, class_3043 (in 2237 in WIN63-202610131318). */
export class WiredLabelsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredLabelsParser);
    }

    public getParser(): WiredLabelsParser
    {
        return this.parser as WiredLabelsParser;
    }
}
