import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/**
 * Number of Builders Club furni placed (AIR WIN63-202610151745-318700621 package_4/class_2878.as:22).
 */
export class BuildersClubFurniCountMessageParser implements IMessageParser
{
    private _furniCount: number;

    public flush(): boolean
    {
        this._furniCount = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._furniCount = wrapper.readInt();

        return true;
    }

    public get furniCount(): number
    {
        return this._furniCount;
    }
}
