import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR WIN63-202610151745-318700621 package_37/class_4333.as:23: the ignored user ids. */
export class IgnoredUsersParser implements IMessageParser
{
    private _ignoredUserIds: number[];

    public flush(): boolean
    {
        this._ignoredUserIds = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._ignoredUserIds = [];

        let count = wrapper.readInt();

        while(count > 0)
        {
            this._ignoredUserIds.push(wrapper.readInt());

            count--;
        }

        return true;
    }

    public get ignoredUserIds(): number[]
    {
        return this._ignoredUserIds;
    }
}
