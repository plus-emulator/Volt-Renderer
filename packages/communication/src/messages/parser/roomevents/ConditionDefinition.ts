import { IMessageDataWrapper } from '@volt/api';
import { Triggerable } from './Triggerable';
import { readWiredBoolean } from './WiredEditorData';

export class ConditionDefinition extends Triggerable
{
    private _quantifier: number;
    private _quantifierType: number;
    private _inverse: boolean;
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
        this._quantifier = wrapper.readInt();
        this.readFooter(wrapper, () =>
        {
            this._quantifierType = wrapper.readByte();
            this._inverse = readWiredBoolean(wrapper);
        });
    }
    public get type(): number
    {
        return this.code;
    }
    public get quantifier(): number
    {
        return this._quantifier;
    }
    public get quantifierType(): number
    {
        return this._quantifierType;
    }
    public get inverse(): boolean
    {
        return this._inverse;
    }
}
