import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { TriggerDefinition } from './TriggerDefinition';

export class WiredFurniTriggerParser implements IMessageParser
{
    private _definition: TriggerDefinition;

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
            this._definition = new TriggerDefinition(wrapper);
            return true;
        }
        catch
        {
            this._definition = null;
            return false;
        }
    }

    public get definition(): TriggerDefinition
    {
        return this._definition;
    }
}
