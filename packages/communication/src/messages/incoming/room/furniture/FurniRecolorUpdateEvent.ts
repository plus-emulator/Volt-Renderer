import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
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
