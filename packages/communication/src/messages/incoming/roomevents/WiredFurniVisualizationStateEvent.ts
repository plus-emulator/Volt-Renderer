import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredFurniVisualizationStateParser } from '../../parser';

/** The furni transparency and highlight state on room entry, class_3560 (in 1826 in WIN63-202610131318). */
export class WiredFurniVisualizationStateEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredFurniVisualizationStateParser);
    }

    public getParser(): WiredFurniVisualizationStateParser
    {
        return this.parser as WiredFurniVisualizationStateParser;
    }
}
