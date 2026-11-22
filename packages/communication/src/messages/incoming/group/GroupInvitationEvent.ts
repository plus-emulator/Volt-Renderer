import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { GroupInvitationParser } from '../../parser';

export class GroupInvitationEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, GroupInvitationParser);
    }

    public getParser(): GroupInvitationParser
    {
        return this.parser as GroupInvitationParser;
    }
}
