import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredSetUserPermanentVariableResultParser } from '../../parser';

export class WiredSetUserPermanentVariableResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredSetUserPermanentVariableResultParser);
    }

    public getParser(): WiredSetUserPermanentVariableResultParser
    {
        return this.parser as WiredSetUserPermanentVariableResultParser;
    }
}
