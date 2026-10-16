import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** package_121.class_3679 -> class_2713 (WIN63-202610131318-860371703, parse L25-30): canModify, then canRead, nothing after. */
export class WiredPermissionsParser implements IMessageParser
{
    private _canModify: boolean;
    private _canRead: boolean;

    public flush(): boolean
    {
        this._canModify = false;
        this._canRead = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._canModify = wrapper.readBoolean();
        this._canRead = wrapper.readBoolean();

        return true;
    }

    public get canModify(): boolean
    {
        return this._canModify;
    }

    public get canRead(): boolean
    {
        return this._canRead;
    }
}
