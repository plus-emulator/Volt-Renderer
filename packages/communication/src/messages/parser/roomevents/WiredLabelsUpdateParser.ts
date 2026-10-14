import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { readWiredCount, readWiredInts } from './WiredEditorData';
import { parseWiredLabelOrRegion, WiredLabelOrRegion } from './WiredLabelData';

/** class_3772 (in 796 in WIN63-202610131318): labels and regions added or changed, then the furni ids that lost theirs. */
export class WiredLabelsUpdateParser implements IMessageParser
{
    private _updated: WiredLabelOrRegion[] = [];
    private _removedFurniIds: number[] = [];

    public flush(): boolean
    {
        this._updated = [];
        this._removedFurniIds = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        try
        {
            this._updated = Array.from({ length: readWiredCount(wrapper) }, () => parseWiredLabelOrRegion(wrapper));
            this._removedFurniIds = readWiredInts(wrapper);
        }
        catch
        {
            return false;
        }

        return true;
    }

    public get updated(): WiredLabelOrRegion[]
    {
        return this._updated;
    }

    public get removedFurniIds(): number[]
    {
        return this._removedFurniIds;
    }
}
