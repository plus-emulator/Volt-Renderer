import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { RoomRightsOwnerParser } from '../../../../parser';

export class RoomRightsOwnerEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, RoomRightsOwnerParser);
    }

    public getParser(): RoomRightsOwnerParser
    {
        return this.parser as RoomRightsOwnerParser;
    }
}
