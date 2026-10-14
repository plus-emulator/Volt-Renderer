import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { readWiredInt64 } from './WiredInt64';

export const WIRED_WALL_INSPECTION_TOKENS = Object.freeze([
    '@id', '@class_id', '@position.x', '@position.y', '@position', '@occupation', '@rotation', '@altitude', '@wallitem_offset'
]);

export class WiredVariableInspectionDataParser implements IMessageParser
{
    private _requestId = 0;
    private _roomId = 0;
    private _entityId = 0;
    private _status = 2;
    private _values: ReadonlyMap<string, bigint> = new Map();

    public flush(): boolean
    {
        this._requestId = 0;
        this._roomId = 0;
        this._entityId = 0;
        this._status = 2;
        this._values = new Map();
        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();
        try
        {
            if(!wrapper || wrapper.readInt() !== 1) return false;
            const requestId = wrapper.readInt();
            const roomId = wrapper.readInt();
            const target = wrapper.readInt();
            const entityId = wrapper.readInt();
            const domain = wrapper.readInt();
            const status = wrapper.readInt();
            const count = wrapper.readInt();
            if(requestId <= 0 || roomId <= 0 || entityId <= 0 || target !== 1 || domain !== 1
                || status < 0 || status > 3 || count !== (status === 0 ? WIRED_WALL_INSPECTION_TOKENS.length : 0)) return false;
            const values = new Map<string, bigint>();
            for(let index = 0; index < count; index++)
            {
                const token = wrapper.readString();
                if(!WIRED_WALL_INSPECTION_TOKENS.includes(token) || values.has(token) || !wrapper.readBoolean()) return false;
                values.set(token, readWiredInt64(wrapper));
            }
            if(wrapper.remainingBytes !== 0) return false;
            this._requestId = requestId;
            this._roomId = roomId;
            this._entityId = entityId;
            this._status = status;
            this._values = values;
            return true;
        }
        catch
        {
            this.flush();
            return false;
        }
    }

    public get requestId(): number
    {
        return this._requestId;
    }
    public get roomId(): number
    {
        return this._roomId;
    }
    public get target(): number
    {
        return 1;
    }
    public get entityId(): number
    {
        return this._entityId;
    }
    public get domain(): number
    {
        return 1;
    }
    public get status(): number
    {
        return this._status;
    }
    public get values(): ReadonlyMap<string, bigint>
    {
        return this._values;
    }
}
