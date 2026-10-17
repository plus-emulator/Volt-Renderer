import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR WIN63-202610151745-318700621 userdefinedroomevents/class_3246.as:27: a localization key, then (key, value) placeholder pairs. */
export class WiredValidationErrorParser implements IMessageParser
{
    private _info: string;
    private _parameters: { key: string; value: string }[];

    public flush(): boolean
    {
        this._info = null;
        this._parameters = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._info = wrapper.readString();
        this._parameters = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._parameters.push({ key: wrapper.readString(), value: wrapper.readString() });
        }

        return true;
    }

    public get info(): string
    {
        return this._info;
    }

    public get parameters(): { key: string; value: string }[]
    {
        return this._parameters;
    }
}
