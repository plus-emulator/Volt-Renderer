import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { UserNftWardrobeMessageParser } from '../../parser';

export class UserNftWardrobeMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, UserNftWardrobeMessageParser);
    }

    public getParser(): UserNftWardrobeMessageParser
    {
        return this.parser as UserNftWardrobeMessageParser;
    }
}
