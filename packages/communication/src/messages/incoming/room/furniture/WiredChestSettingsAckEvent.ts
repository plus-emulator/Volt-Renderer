import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredChestSettingsAckParser } from '../../../parser';

export class WiredChestSettingsAckEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredChestSettingsAckParser);
    }

    public getParser(): WiredChestSettingsAckParser
    {
        return this.parser as WiredChestSettingsAckParser;
    }
}
