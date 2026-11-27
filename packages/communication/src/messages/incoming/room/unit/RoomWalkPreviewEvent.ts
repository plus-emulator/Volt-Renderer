import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { RoomWalkPreviewParser } from '../../../parser';

export class RoomWalkPreviewEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, RoomWalkPreviewParser);
    }

    public getParser(): RoomWalkPreviewParser
    {
        return this.parser as RoomWalkPreviewParser;
    }
}
