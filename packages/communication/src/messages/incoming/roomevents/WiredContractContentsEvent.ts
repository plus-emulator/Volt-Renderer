import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredContractContentsParser } from '../../parser';

export class WiredContractContentsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredContractContentsParser);
    }
    public getParser(): WiredContractContentsParser
    {
        return this.parser as WiredContractContentsParser;
    }
}
