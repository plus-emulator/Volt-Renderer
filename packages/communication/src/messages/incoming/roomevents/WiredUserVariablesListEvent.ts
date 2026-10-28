import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredUserVariablesListParser } from '../../parser';

export class WiredUserVariablesListEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredUserVariablesListParser);
    }

    public getParser(): WiredUserVariablesListParser
    {
        return this.parser as WiredUserVariablesListParser;
    }
}
