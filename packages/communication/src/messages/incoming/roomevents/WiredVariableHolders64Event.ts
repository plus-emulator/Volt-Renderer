import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredVariableHolders64Parser } from '../../parser';

export class WiredVariableHolders64Event extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredVariableHolders64Parser);
    }

    public getParser(): WiredVariableHolders64Parser
    {
        return this.parser as WiredVariableHolders64Parser;
    }
}
