import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { ConditionDefinition } from './ConditionDefinition';

export class WiredFurniConditionParser implements IMessageParser
{
    private _definition: ConditionDefinition;

    public flush(): boolean
    {
        this._definition = null;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        try
        {
            this._definition = new ConditionDefinition(wrapper);
            return true;
        }
        catch
        {
            this._definition = null;
            return false;
        }
    }

    public get definition(): ConditionDefinition
    {
        return this._definition;
    }
}
