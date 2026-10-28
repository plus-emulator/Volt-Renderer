import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { readWiredSignedLong } from './WiredVariableData';

/** One monitor error row (AIR WIN63-202610201032-107964540 package_121/class_4373.as). */
export interface IWiredErrorLogEntry
{
    errorId: number;
    errorName: string;
    category: string;
    throwCount: number;
    /** Negative when the error never happened. */
    msSinceLastOccurrence: number;
}

/** The monitor tab's error table (AIR WIN63-202610201032-107964540 parser/userdefinedroomevents/wiredmenu/class_4261.as). */
export class WiredErrorLogsParser implements IMessageParser
{
    private _errors: IWiredErrorLogEntry[] = [];

    public flush(): boolean
    {
        this._errors = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._errors = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._errors.push({
                errorId: wrapper.readInt(),
                errorName: wrapper.readString(),
                category: wrapper.readString(),
                throwCount: wrapper.readInt(),
                msSinceLastOccurrence: readWiredSignedLong(wrapper)
            });
        }

        return true;
    }

    public get errors(): IWiredErrorLogEntry[]
    {
        return this._errors;
    }
}
