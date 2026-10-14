import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { WiredActionDefinition } from './WiredActionDefinition';

export class WiredFurniActionParser implements IMessageParser
{
    private _definition: WiredActionDefinition;

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
            this._definition = new WiredActionDefinition(wrapper);
            return true;
        }
        catch
        {
            this._definition = null;
            return false;
        }
    }

    public get definition(): WiredActionDefinition
    {
        return this._definition;
    }
}
