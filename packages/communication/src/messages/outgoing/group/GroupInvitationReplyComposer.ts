import { IMessageComposer } from '@volt/api';

/** answer: 0 accept, 1 reject, 2 decide later. */
export class GroupInvitationReplyComposer implements IMessageComposer<ConstructorParameters<typeof GroupInvitationReplyComposer>>
{
    private _data: ConstructorParameters<typeof GroupInvitationReplyComposer>;

    constructor(groupId: number, answer: number)
    {
        this._data = [ groupId, answer ];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
