import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { CraftingResultObjectParser } from './CraftingResultObjectParser';

export class CraftingResultMessageParser implements IMessageParser
{
    private _success: boolean;
    private _result: CraftingResultObjectParser = null;

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;
        this._success = wrapper.readBoolean();
        this._result = this._success ? new CraftingResultObjectParser(wrapper) : null;
        return true;
    }

    public flush(): boolean
    {
        this._success = false;
        this._result = null;
        return true;
    }

    public get success(): boolean
    {
        return this._success;
    }

    public get result(): CraftingResultObjectParser
    {
        return this._result;
    }
}
