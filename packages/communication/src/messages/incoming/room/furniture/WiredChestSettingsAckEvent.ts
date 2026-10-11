import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
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
