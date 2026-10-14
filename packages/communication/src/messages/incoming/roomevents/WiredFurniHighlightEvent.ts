import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredFurniHighlightParser } from '../../parser';

/** The set furni highlight, class_2680 (in 2380 in WIN63-202610131318). */
export class WiredFurniHighlightEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredFurniHighlightParser);
    }

    public getParser(): WiredFurniHighlightParser
    {
        return this.parser as WiredFurniHighlightParser;
    }
}
