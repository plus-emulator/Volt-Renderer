import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredUserVariablesData64Parser } from '../../parser';

export class WiredUserVariablesData64Event extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredUserVariablesData64Parser);
    }

    public getParser(): WiredUserVariablesData64Parser
    {
        return this.parser as WiredUserVariablesData64Parser;
    }
}
