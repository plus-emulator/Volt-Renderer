import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { readWiredInts } from './WiredEditorData';

/**
 * Furni highlighted by "set furni highlight", class_3488 in WIN63-202610131318 (L40-56): count, furni ids,
 * highlightType (0 outline, 1 soft glow, 2 darken, 3 colour tint, 4 brighten, 5 neon aura), strength,
 * color (RGB), animationMode (0 steady, 1 pulse), easingMode.
 */
export class WiredFurniHighlightParser implements IMessageParser
{
    private _furniIds: number[] = [];
    private _highlightType = 0;
    private _strength = 0;
    private _color = 0;
    private _animationMode = 0;
    private _easingMode = 0;

    public flush(): boolean
    {
        this._furniIds = [];
        this._highlightType = 0;
        this._strength = 0;
        this._color = 0;
        this._animationMode = 0;
        this._easingMode = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._furniIds = readWiredInts(wrapper);
        this._highlightType = wrapper.readInt();
        this._strength = wrapper.readInt();
        this._color = wrapper.readInt();
        this._animationMode = wrapper.readInt();
        this._easingMode = wrapper.readInt();

        return true;
    }

    public get furniIds(): number[]
    {
        return this._furniIds;
    }

    public get highlightType(): number
    {
        return this._highlightType;
    }

    public get strength(): number
    {
        return this._strength;
    }

    public get color(): number
    {
        return this._color;
    }

    public get animationMode(): number
    {
        return this._animationMode;
    }

    public get easingMode(): number
    {
        return this._easingMode;
    }
}

/** The user variant, class_2412 in WIN63-202610131318 (parse L37-57): the same body with room unit indices. */
export class WiredUserHighlightParser extends WiredFurniHighlightParser
{
    public get roomIndices(): number[]
    {
        return this.furniIds;
    }
}
