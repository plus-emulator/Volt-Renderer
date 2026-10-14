import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredVariableHoldersPage64Parser } from '../../parser';

export class WiredVariableHoldersPage64Event extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredVariableHoldersPage64Parser);
    }

    public getParser(): WiredVariableHoldersPage64Parser
    {
        return this.parser as WiredVariableHoldersPage64Parser;
    }
}
