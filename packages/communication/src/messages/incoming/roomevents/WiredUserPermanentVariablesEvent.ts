import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredUserPermanentVariablesParser } from '../../parser';

export class WiredUserPermanentVariablesEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredUserPermanentVariablesParser);
    }

    public getParser(): WiredUserPermanentVariablesParser
    {
        return this.parser as WiredUserPermanentVariablesParser;
    }
}
