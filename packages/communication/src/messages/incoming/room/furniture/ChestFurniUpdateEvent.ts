import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { ChestFurniUpdateMessageParser } from '../../../parser';

export class ChestFurniUpdateEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, ChestFurniUpdateMessageParser);
    }

    public getParser(): ChestFurniUpdateMessageParser
    {
        return this.parser as ChestFurniUpdateMessageParser;
    }
}
