import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/**
 * One object's variable values (AIR WIN63-202610151745-318700621 package_121/WiredObjectInspectionData.as:25-64): type (0 furni,
 * 1 user, -10 room), the furni's item id or the user's room index (absent for the room), variable id/value pairs, and for a furni the
 * ids of the Wired boxes that pick it.
 */
export class WiredVariablesForObjectParser implements IMessageParser
{
    private _type = 0;
    private _objectId = 0;
    private _values: ReadonlyMap<string, number> = new Map();
    private _configuredInWireds: number[] = [];

    public flush(): boolean
    {
        this._type = 0;
        this._objectId = 0;
        this._values = new Map();
        this._configuredInWireds = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._type = wrapper.readInt();
        if(this._type === 0 || this._type === 1) this._objectId = wrapper.readInt();

        const values = new Map<string, number>();
        let count = wrapper.readInt();

        while(count-- > 0)
        {
            const id = wrapper.readString();
            values.set(id, wrapper.readInt());
        }

        this._values = values;

        if(this._type === 0)
        {
            const configured: number[] = [];
            let boxes = wrapper.readInt();

            while(boxes-- > 0) configured.push(wrapper.readInt());

            this._configuredInWireds = configured;
        }

        return wrapper.remainingBytes === 0;
    }

    public get type(): number
    {
        return this._type;
    }

    public get objectId(): number
    {
        return this._objectId;
    }

    public get values(): ReadonlyMap<string, number>
    {
        return this._values;
    }

    public get configuredInWireds(): readonly number[]
    {
        return this._configuredInWireds;
    }
}
