import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { BuildersClubFurniCountMessageParser } from '../../parser';

export class BuildersClubFurniCountMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, BuildersClubFurniCountMessageParser);
    }

    public getParser(): BuildersClubFurniCountMessageParser
    {
        return this.parser as BuildersClubFurniCountMessageParser;
    }
}
