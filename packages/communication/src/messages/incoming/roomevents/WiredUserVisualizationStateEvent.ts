import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredUserVisualizationStateParser } from '../../parser';

/** The user transparency and highlight state on room entry, class_3459 (in 1454 in WIN63-202610131318). */
export class WiredUserVisualizationStateEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredUserVisualizationStateParser);
    }

    public getParser(): WiredUserVisualizationStateParser
    {
        return this.parser as WiredUserVisualizationStateParser;
    }
}
