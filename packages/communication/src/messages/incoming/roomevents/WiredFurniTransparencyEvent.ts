import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredFurniTransparencyParser } from '../../parser';

/** The set furni transparency, class_3390 (in 2321 in WIN63-202610131318). */
export class WiredFurniTransparencyEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredFurniTransparencyParser);
    }

    public getParser(): WiredFurniTransparencyParser
    {
        return this.parser as WiredFurniTransparencyParser;
    }
}
