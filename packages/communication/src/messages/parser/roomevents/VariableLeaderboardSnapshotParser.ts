import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { IVariableLeaderboardDescriptor, parseVariableLeaderboardDescriptor } from './VariableLeaderboardData';

/** package_135.class_2558 (in 1494 in WIN63-202610131318): up to 4 overlay descriptors, the whole set for the room. */
export class VariableLeaderboardSnapshotParser implements IMessageParser
{
    public static readonly MAXIMUM_OVERLAYS = 4;

    private _descriptors: IVariableLeaderboardDescriptor[] = [];

    public flush(): boolean
    {
        this._descriptors = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count = wrapper.readInt();

        if((count < 0) || (count > VariableLeaderboardSnapshotParser.MAXIMUM_OVERLAYS)) return false;

        const descriptors: IVariableLeaderboardDescriptor[] = [];

        for(let i = 0; i < count; i++)
        {
            const descriptor = parseVariableLeaderboardDescriptor(wrapper);

            if(!descriptor) return false;

            descriptors.push(descriptor);
        }

        this._descriptors = descriptors;

        return true;
    }

    public get descriptors(): IVariableLeaderboardDescriptor[]
    {
        return this._descriptors;
    }
}
