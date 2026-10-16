import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { FurnitureMetadataParser } from '../../../parser';

export class FurnitureMetadataEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, FurnitureMetadataParser);
    }

    public getParser(): FurnitureMetadataParser
    {
        return this.parser as FurnitureMetadataParser;
    }
}
