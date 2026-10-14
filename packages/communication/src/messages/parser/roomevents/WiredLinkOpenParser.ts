import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** class_4274 (in 1715 in WIN63-202610131318): the furni id of the WIRED Link to open. */
export class WiredLinkOpenParser implements IMessageParser
{
    private _furniId = 0;

    public flush(): boolean
    {
        this._furniId = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._furniId = wrapper.readInt();

        return true;
    }

    public get furniId(): number
    {
        return this._furniId;
    }
}
