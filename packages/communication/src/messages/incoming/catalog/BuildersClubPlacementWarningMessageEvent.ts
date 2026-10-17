import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { BuildersClubPlacementWarningMessageParser } from '../../parser';

export class BuildersClubPlacementWarningMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, BuildersClubPlacementWarningMessageParser);
    }

    public getParser(): BuildersClubPlacementWarningMessageParser
    {
        return this.parser as BuildersClubPlacementWarningMessageParser;
    }
}
