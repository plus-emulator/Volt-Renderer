import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { readWiredCount } from './WiredEditorData';

/** FurniTransparencyData / UserTransparencyData: the id is a furni id (negative for wall items) or a room unit index. */
export interface IWiredTransparencyState
{
    id: number;
    transparency: number;
    allowClickThrough: boolean;
    easingMode: number;
}

/** FurniHighlightData / UserHighlightData. */
export interface IWiredHighlightState
{
    id: number;
    highlightType: number;
    strength: number;
    color: number;
    animationMode: number;
    easingMode: number;
}

/**
 * The transparency and highlight a room already shows, sent to a user entering it: class_3015 (furni, in 3355) and
 * class_2803 (users, in 2901) in WIN63-202610131318, parse L25-52. Both read the transparency list, then the
 * highlight list.
 */
export class WiredVisualizationStateParser implements IMessageParser
{
    private _transparencies: IWiredTransparencyState[] = [];
    private _highlights: IWiredHighlightState[] = [];

    public flush(): boolean
    {
        this._transparencies = [];
        this._highlights = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._transparencies = Array.from({ length: readWiredCount(wrapper) }, () => ({
            id: wrapper.readInt(),
            transparency: wrapper.readInt(),
            allowClickThrough: wrapper.readBoolean(),
            easingMode: wrapper.readInt()
        }));
        this._highlights = Array.from({ length: readWiredCount(wrapper) }, () => ({
            id: wrapper.readInt(),
            highlightType: wrapper.readInt(),
            strength: wrapper.readInt(),
            color: wrapper.readInt(),
            animationMode: wrapper.readInt(),
            easingMode: wrapper.readInt()
        }));

        return true;
    }

    public get transparencies(): IWiredTransparencyState[]
    {
        return this._transparencies;
    }

    public get highlights(): IWiredHighlightState[]
    {
        return this._highlights;
    }
}

export class WiredFurniVisualizationStateParser extends WiredVisualizationStateParser
{
}

export class WiredUserVisualizationStateParser extends WiredVisualizationStateParser
{
}
