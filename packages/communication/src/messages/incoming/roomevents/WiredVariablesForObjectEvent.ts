import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredVariablesForObjectParser } from '../../parser';

export class WiredVariablesForObjectEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredVariablesForObjectParser);
    }

    public getParser(): WiredVariablesForObjectParser
    {
        return this.parser as WiredVariablesForObjectParser;
    }
}
