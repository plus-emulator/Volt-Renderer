import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredVariableInspectionDataParser } from '../../parser';

export class WiredVariableInspectionDataEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredVariableInspectionDataParser);
    }

    public getParser(): WiredVariableInspectionDataParser
    {
        return this.parser as WiredVariableInspectionDataParser;
    }
}
