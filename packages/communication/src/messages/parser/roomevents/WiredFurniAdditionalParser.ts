import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { WiredSelectorDefinition, WiredAddonDefinition, WiredVariableDefinition } from './WiredAdditionalDefinitions';

export class WiredFurniSelectorParser implements IMessageParser
{
    private _definition: WiredSelectorDefinition;
    public flush(): boolean
    {
        this._definition = null; return true;
    }
    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this._definition = null;
        if(!wrapper) return false;
        try
        {
            this._definition = new WiredSelectorDefinition(wrapper); return true;
        }
        catch
        {
            return false;
        }
    }
    public get definition(): WiredSelectorDefinition
    {
        return this._definition;
    }
}


export class WiredFurniAddonParser implements IMessageParser
{
    private _definition: WiredAddonDefinition;
    public flush(): boolean
    {
        this._definition = null; return true;
    }
    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this._definition = null;
        if(!wrapper) return false;
        try
        {
            this._definition = new WiredAddonDefinition(wrapper); return true;
        }
        catch
        {
            return false;
        }
    }
    public get definition(): WiredAddonDefinition
    {
        return this._definition;
    }
}


export class WiredFurniVariableParser implements IMessageParser
{
    private _definition: WiredVariableDefinition;
    public flush(): boolean
    {
        this._definition = null; return true;
    }
    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this._definition = null;
        if(!wrapper) return false;
        try
        {
            this._definition = new WiredVariableDefinition(wrapper); return true;
        }
        catch
        {
            return false;
        }
    }
    public get definition(): WiredVariableDefinition
    {
        return this._definition;
    }
}
