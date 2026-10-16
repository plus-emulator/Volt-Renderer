import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { RoomEnterParser } from '../../../parser';

export class RoomEnterEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, RoomEnterParser);
    }

    public getParser(): RoomEnterParser
    {
        return this.parser as RoomEnterParser;
    }
}
