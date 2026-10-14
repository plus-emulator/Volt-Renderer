import { IMessageDataWrapper } from '@volt/api';
import { Triggerable } from './Triggerable';

export class WiredActionDefinition extends Triggerable
{
    private _delayInPulses: number;
    constructor(wrapper: IMessageDataWrapper)
    {
        super(wrapper);
        this._delayInPulses = wrapper.readInt();
        this.readFooter(wrapper);
    }
    public get type(): number
    {
        return this.code;
    }
    public get delayInPulses(): number
    {
        return this._delayInPulses;
    }
}
