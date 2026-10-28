import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredAllVariableHoldersParser } from '../../parser';

export class WiredAllVariableHoldersEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredAllVariableHoldersParser);
    }

    public getParser(): WiredAllVariableHoldersParser
    {
        return this.parser as WiredAllVariableHoldersParser;
    }
}
