import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredPermissionsParser } from '../../parser';

export class WiredPermissionsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredPermissionsParser);
    }

    public getParser(): WiredPermissionsParser
    {
        return this.parser as WiredPermissionsParser;
    }
}
