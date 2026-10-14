import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { readWiredCount } from './WiredEditorData';
import { parseWiredLabelOrRegion, WiredLabelOrRegion } from './WiredLabelData';

/** class_3418 (in 2237 in WIN63-202610131318): every label and region of the room, replacing what was known. */
export class WiredLabelsParser implements IMessageParser
{
    private _entries: WiredLabelOrRegion[] = [];

    public flush(): boolean
    {
        this._entries = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        try
        {
            this._entries = Array.from({ length: readWiredCount(wrapper) }, () => parseWiredLabelOrRegion(wrapper));
        }
        catch
        {
            return false;
        }

        return true;
    }

    public get entries(): WiredLabelOrRegion[]
    {
        return this._entries;
    }
}
