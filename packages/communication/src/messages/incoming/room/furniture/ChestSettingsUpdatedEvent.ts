import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { ChestSettingsUpdatedMessageParser } from '../../../parser';

export class ChestSettingsUpdatedEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, ChestSettingsUpdatedMessageParser);
    }

    public getParser(): ChestSettingsUpdatedMessageParser
    {
        return this.parser as ChestSettingsUpdatedMessageParser;
    }
}
