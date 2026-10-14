import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { readWiredInts } from './WiredEditorData';

/**
 * Furni (or, for the user variant, room units) made transparent by "set furni transparency".
 * class_2988 / class_2441 in WIN63-202610131318: count, ids, transparency (0 visible, 100 invisible),
 * allowClickThrough, easingMode (0 none, 1..4 eased).
 */
export class WiredFurniTransparencyParser implements IMessageParser
{
    private _ids: number[] = [];
    private _transparency = 0;
    private _allowClickThrough = false;
    private _easingMode = 0;

    public flush(): boolean
    {
        this._ids = [];
        this._transparency = 0;
        this._allowClickThrough = false;
        this._easingMode = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._ids = readWiredInts(wrapper);
        this._transparency = wrapper.readInt();
        this._allowClickThrough = wrapper.readBoolean();
        this._easingMode = wrapper.readInt();

        return true;
    }

    /** Furni ids, or room indices for the user variant. */
    public get ids(): number[]
    {
        return this._ids;
    }

    public get transparency(): number
    {
        return this._transparency;
    }

    public get allowClickThrough(): boolean
    {
        return this._allowClickThrough;
    }

    public get easingMode(): number
    {
        return this._easingMode;
    }
}

/** The user variant reads the same body with room indices (class_2441). */
export class WiredUserTransparencyParser extends WiredFurniTransparencyParser
{
}
