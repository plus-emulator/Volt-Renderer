import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredContextMenuParser } from '../../parser';

export class WiredContextMenuEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredContextMenuParser);
    }

    public getParser(): WiredContextMenuParser
    {
        return this.parser as WiredContextMenuParser;
    }
}
