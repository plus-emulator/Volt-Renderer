import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { FurniRecolorUpdateParser } from '../../../parser';

export class FurniRecolorUpdateEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, FurniRecolorUpdateParser);
    }

    public getParser(): FurniRecolorUpdateParser
    {
        return this.parser as FurniRecolorUpdateParser;
    }
}
