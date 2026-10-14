import { IMessageDataWrapper } from '@volt/api';
import { Triggerable } from './Triggerable';
import { readWiredBoolean } from './WiredEditorData';

export class WiredSelectorDefinition extends Triggerable
{
    private _filter: boolean;
    private _inverse: boolean;
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
        this._filter = readWiredBoolean(wrapper);
        this._inverse = readWiredBoolean(wrapper);
        this.readFooter(wrapper);
    }
    public get filter(): boolean
    {
        return this._filter;
    }
    public get inverse(): boolean
    {
        return this._inverse;
    }
}

export class WiredAddonDefinition extends Triggerable
{
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
        this.readFooter(wrapper);
    }
}

export class WiredVariableDefinition extends Triggerable
{
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
        this.readFooter(wrapper);
    }
}
