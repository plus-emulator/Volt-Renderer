import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredContractUpdateResultParser } from '../../parser';

export class WiredContractUpdateResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredContractUpdateResultParser);
    }
    public getParser(): WiredContractUpdateResultParser
    {
        return this.parser as WiredContractUpdateResultParser;
    }
}
