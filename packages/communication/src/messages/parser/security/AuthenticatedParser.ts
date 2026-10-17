import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR WIN63-202610151745-318700621 package_30/class_2929.as:30: account id, suggested login actions, identity id. */
export class AuthenticatedParser implements IMessageParser
{
    private _accountId: number = -1;
    private _suggestedLoginActions: number[] = [];
    private _identityId: number = -1;

    public flush(): boolean
    {
        this._accountId = -1;
        this._suggestedLoginActions = [];
        this._identityId = -1;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._accountId = wrapper.readInt();

        let count = wrapper.readInt();

        while(count > 0)
        {
            this._suggestedLoginActions.push(wrapper.readShort());

            count--;
        }

        this._identityId = wrapper.readInt();

        return true;
    }

    public get accountId(): number
    {
        return this._accountId;
    }

    public get suggestedLoginActions(): number[]
    {
        return this._suggestedLoginActions;
    }

    public get identityId(): number
    {
        return this._identityId;
    }
}
