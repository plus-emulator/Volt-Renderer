import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredContractOpenParser } from '../../parser';

export class WiredContractOpenEvent extends MessageEvent implements IMessageEvent {
    constructor(callBack: Function) { super(callBack, WiredContractOpenParser); }
    public getParser(): WiredContractOpenParser { return this.parser as WiredContractOpenParser; }
}
