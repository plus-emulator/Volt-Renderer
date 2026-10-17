import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { YouAreSpectatorMessageParser } from '../../../parser';

export class YouAreSpectatorMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, YouAreSpectatorMessageParser);
    }

    public getParser(): YouAreSpectatorMessageParser
    {
        return this.parser as YouAreSpectatorMessageParser;
    }
}
