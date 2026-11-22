import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { readWiredCount } from './WiredEditorData';

export interface IWiredContextMenuItem
{
    buttonId: string;
    /** Already has every placeholder filled for the viewer. */
    text: string;
    enabled: boolean;
}

/** The wired context menu items of one target, in add-on order. targetType 0 is a room unit and targetId its room index. */
export class WiredContextMenuParser implements IMessageParser
{
    private _targetType: number;
    private _targetId: number;
    private _items: IWiredContextMenuItem[];

    public flush(): boolean
    {
        this._targetType = 0;
        this._targetId = 0;
        this._items = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._targetType = wrapper.readInt();
        this._targetId = wrapper.readInt();
        this._items = Array.from({ length: readWiredCount(wrapper) }, () => ({
            buttonId: wrapper.readString(),
            text: wrapper.readString(),
            enabled: wrapper.readBoolean()
        }));

        return true;
    }

    public get targetType(): number
    {
        return this._targetType;
    }

    public get targetId(): number
    {
        return this._targetId;
    }

    public get items(): IWiredContextMenuItem[]
    {
        return this._items;
    }
}
