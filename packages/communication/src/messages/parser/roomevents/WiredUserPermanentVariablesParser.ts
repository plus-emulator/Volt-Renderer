import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { IWiredVariableTimedValue, readWiredVariableStorage } from './WiredVariableStorageParameter';

export interface IWiredPermanentVariable extends IWiredVariableTimedValue
{
    variableId: string;
}

export class WiredUserPermanentVariablesParser implements IMessageParser
{
    private _entityType = 0;
    private _entityId = 0;
    private _entityName = '';
    private _entityFigure = '';
    private _ownerId = 0;
    private _ownerName = '';
    private _ownerFigure = '';
    private _variables: readonly IWiredPermanentVariable[] = [];

    public flush(): boolean
    {
        this._entityType = 0;
        this._entityId = 0;
        this._entityName = '';
        this._entityFigure = '';
        this._ownerId = 0;
        this._ownerName = '';
        this._ownerFigure = '';
        this._variables = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();

        try
        {
            if(!wrapper) return false;

            this._entityType = wrapper.readInt();
            this._entityId = wrapper.readInt();
            this._entityName = wrapper.readString();
            this._entityFigure = wrapper.readString();

            if(this._entityType !== 1)
            {
                this._ownerId = wrapper.readInt();
                this._ownerName = wrapper.readString();
                this._ownerFigure = wrapper.readString();
            }

            const count = wrapper.readInt();

            if(count < 0) throw new Error('Invalid variable count');

            const variables: IWiredPermanentVariable[] = [];

            for(let index = 0; index < count; index++)
            {
                const variableId = wrapper.readString();

                variables.push(Object.freeze({ variableId, ...readWiredVariableStorage(wrapper) }));
            }

            this._variables = Object.freeze(variables);

            return wrapper.remainingBytes === 0;
        }
        catch
        {
            this.flush();

            return false;
        }
    }

    public get entityType(): number
    {
        return this._entityType;
    }

    public get entityId(): number
    {
        return this._entityId;
    }

    public get entityName(): string
    {
        return this._entityName;
    }

    public get entityFigure(): string
    {
        return this._entityFigure;
    }

    public get ownerId(): number
    {
        return this._ownerId;
    }

    public get ownerName(): string
    {
        return this._ownerName;
    }

    public get ownerFigure(): string
    {
        return this._ownerFigure;
    }

    public get variables(): readonly IWiredPermanentVariable[]
    {
        return this._variables;
    }
}
