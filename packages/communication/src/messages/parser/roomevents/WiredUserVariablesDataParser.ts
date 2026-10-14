import { IMessageDataWrapper, IMessageParser } from '@volt/api';

export interface IWiredArrayFieldDefinitionData
{
    id: number;
    name: string;
    order: number;
    textConnected?: boolean;
}

export interface IWiredVariableTextConnectorEntry
{
    key: number;
    value: string;
}

export interface IWiredArrayVariableMetadata
{
    arrayFormat?: 'simple' | 'record';
    arrayMode?: 'list' | 'slots';
    fields?: IWiredArrayFieldDefinitionData[];
    maxEntries?: number;
    permanent?: boolean;
    /** The value-to-text table of a text connected definition, when the server sent one. */
    textConnector?: IWiredVariableTextConnectorEntry[];
    /** Set when the server reported a stored array schema it could not parse. */
    unavailable?: boolean;
    valueShape?: 'single' | 'array';
}

export interface IWiredUserVariableDefinitionData extends IWiredArrayVariableMetadata
{
    availability: number;
    hasValue: boolean;
    isReadOnly: boolean;
    isTextConnected: boolean;
    itemId: number;
    name: string;
}

export interface IWiredUserVariableAssignmentData<T extends number | bigint = number>
{
    createdAt: number;
    hasValue: boolean;
    updatedAt: number;
    value: T | null;
    variableItemId: number;
}

export interface IWiredUserVariablesUserData<T extends number | bigint = number>
{
    assignments: IWiredUserVariableAssignmentData<T>[];
    userId: number;
}

export interface IWiredFurniVariableDefinitionData extends IWiredArrayVariableMetadata
{
    availability: number;
    hasValue: boolean;
    isReadOnly: boolean;
    isTextConnected: boolean;
    itemId: number;
    name: string;
}

export interface IWiredUserVariablesFurniData<T extends number | bigint = number>
{
    assignments: IWiredUserVariableAssignmentData<T>[];
    furniId: number;
}

export interface IWiredRoomVariableDefinitionData extends IWiredArrayVariableMetadata
{
    availability: number;
    hasValue: boolean;
    isReadOnly: boolean;
    isTextConnected: boolean;
    itemId: number;
    name: string;
}

export interface IWiredRoomVariableAssignmentData<T extends number | bigint = number>
{
    createdAt: number;
    hasValue: boolean;
    updatedAt: number;
    value: T | null;
    variableItemId: number;
}

export interface IWiredContextVariableDefinitionData extends IWiredArrayVariableMetadata
{
    availability: number;
    hasValue: boolean;
    isReadOnly: boolean;
    isTextConnected: boolean;
    itemId: number;
    name: string;
}

export class WiredUserVariablesDataParser<T extends number | bigint = number> implements IMessageParser
{
    private _roomId: number;
    private _definitions: IWiredUserVariableDefinitionData[];
    private _users: IWiredUserVariablesUserData<T>[];
    private _furniDefinitions: IWiredFurniVariableDefinitionData[];
    private _furnis: IWiredUserVariablesFurniData<T>[];
    private _roomDefinitions: IWiredRoomVariableDefinitionData[];
    private _roomAssignments: IWiredRoomVariableAssignmentData<T>[];
    private _contextDefinitions: IWiredContextVariableDefinitionData[];

    protected readScalarValue(wrapper: IMessageDataWrapper): T
    {
        return wrapper.readInt() as T;
    }

    public flush(): boolean
    {
        this._roomId = 0;
        this._definitions = [];
        this._users = [];
        this._furniDefinitions = [];
        this._furnis = [];
        this._roomDefinitions = [];
        this._roomAssignments = [];
        this._contextDefinitions = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();

        let totalDefinitions = wrapper.readInt();
        if(totalDefinitions < 0) return false;

        this._definitions = [];
        this._users = [];
        this._furniDefinitions = [];
        this._furnis = [];
        this._roomDefinitions = [];
        this._roomAssignments = [];
        this._contextDefinitions = [];

        while(totalDefinitions > 0)
        {
            this._definitions.push({
                itemId: wrapper.readInt(),
                name: wrapper.readString(),
                hasValue: wrapper.readBoolean(),
                availability: wrapper.readInt(),
                isTextConnected: wrapper.readBoolean(),
                isReadOnly: wrapper.readBoolean()
            });

            totalDefinitions--;
        }

        let totalUsers = wrapper.readInt();
        if(totalUsers < 0) return false;

        while(totalUsers > 0)
        {
            const userId = wrapper.readInt();
            let totalAssignments = wrapper.readInt();
            if(totalAssignments < 0) return false;
            const assignments: IWiredUserVariableAssignmentData<T>[] = [];

            while(totalAssignments > 0)
            {
                const variableItemId = wrapper.readInt();
                const hasValue = wrapper.readBoolean();
                const rawValue = this.readScalarValue(wrapper);
                const createdAt = wrapper.readInt();
                const updatedAt = wrapper.readInt();

                assignments.push({
                    variableItemId,
                    hasValue,
                    value: (hasValue ? rawValue : null),
                    createdAt,
                    updatedAt
                });

                totalAssignments--;
            }

            this._users.push({ userId, assignments });
            totalUsers--;
        }

        let totalFurniDefinitions = wrapper.readInt();
        if(totalFurniDefinitions < 0) return false;

        while(totalFurniDefinitions > 0)
        {
            this._furniDefinitions.push({
                itemId: wrapper.readInt(),
                name: wrapper.readString(),
                hasValue: wrapper.readBoolean(),
                availability: wrapper.readInt(),
                isTextConnected: wrapper.readBoolean(),
                isReadOnly: wrapper.readBoolean()
            });

            totalFurniDefinitions--;
        }

        let totalFurnis = wrapper.readInt();
        if(totalFurnis < 0) return false;

        while(totalFurnis > 0)
        {
            const furniId = wrapper.readInt();
            let totalAssignments = wrapper.readInt();
            if(totalAssignments < 0) return false;
            const assignments: IWiredUserVariableAssignmentData<T>[] = [];

            while(totalAssignments > 0)
            {
                const variableItemId = wrapper.readInt();
                const hasValue = wrapper.readBoolean();
                const rawValue = this.readScalarValue(wrapper);
                const createdAt = wrapper.readInt();
                const updatedAt = wrapper.readInt();

                assignments.push({
                    variableItemId,
                    hasValue,
                    value: (hasValue ? rawValue : null),
                    createdAt,
                    updatedAt
                });

                totalAssignments--;
            }

            this._furnis.push({ furniId, assignments });
            totalFurnis--;
        }

        let totalRoomDefinitions = wrapper.readInt();
        if(totalRoomDefinitions < 0) return false;

        while(totalRoomDefinitions > 0)
        {
            this._roomDefinitions.push({
                itemId: wrapper.readInt(),
                name: wrapper.readString(),
                hasValue: wrapper.readBoolean(),
                availability: wrapper.readInt(),
                isTextConnected: wrapper.readBoolean(),
                isReadOnly: wrapper.readBoolean()
            });

            totalRoomDefinitions--;
        }

        let totalRoomAssignments = wrapper.readInt();
        if(totalRoomAssignments < 0) return false;

        while(totalRoomAssignments > 0)
        {
            const variableItemId = wrapper.readInt();
            const hasValue = wrapper.readBoolean();
            const rawValue = this.readScalarValue(wrapper);
            const createdAt = wrapper.readInt();
            const updatedAt = wrapper.readInt();

            this._roomAssignments.push({
                variableItemId,
                hasValue,
                value: (hasValue ? rawValue : null),
                createdAt,
                updatedAt
            });

            totalRoomAssignments--;
        }

        let totalContextDefinitions = wrapper.readInt();
        if(totalContextDefinitions < 0) return false;

        while(totalContextDefinitions > 0)
        {
            this._contextDefinitions.push({
                itemId: wrapper.readInt(),
                name: wrapper.readString(),
                hasValue: wrapper.readBoolean(),
                availability: wrapper.readInt(),
                isTextConnected: wrapper.readBoolean(),
                isReadOnly: wrapper.readBoolean()
            });

            totalContextDefinitions--;
        }

        if(wrapper.bytesAvailable) this.mergeArrayMetadata(wrapper.readString());

        return true;
    }

    private mergeArrayMetadata(rawValue: string): void
    {
        try
        {
            const values = JSON.parse(rawValue);

            if(!Array.isArray(values)) return;

            for(const value of values)
            {
                if(!value || !Number.isInteger(value.itemId)) continue;

                const definitions = value.variableType === 0
                    ? this._furniDefinitions
                    : value.variableType === 1
                        ? this._roomDefinitions
                        : value.variableType === 2
                            ? this._definitions
                            : value.variableType === 3
                                ? this._contextDefinitions
                                : null;
                const definition = definitions?.find(current => current.itemId === value.itemId);

                if(!definition) continue;

                if(Array.isArray(value.textConnector))
                {
                    definition.textConnector = value.textConnector
                        .filter((entry: any) => entry && Number.isInteger(entry.key) && typeof entry.value === 'string')
                        .map((entry: any) => ({ key: entry.key, value: entry.value }));
                }

                // An entry that only carries a text connector says nothing about the value shape.
                if(value.valueShape === undefined) continue;

                // A schema the server could not parse is neither a usable array nor a scalar, so it
                // stays unselectable instead of being flattened into a scalar the editors would offer.
                if(value.valueShape === 'array_unavailable')
                {
                    definition.hasValue = false;
                    definition.unavailable = true;
                    continue;
                }

                definition.valueShape = value.valueShape === 'array' ? 'array' : 'single';
                definition.arrayFormat = value.arrayFormat === 'record' ? 'record' : 'simple';
                definition.arrayMode = value.arrayMode === 'slots' ? 'slots' : 'list';
                definition.maxEntries = Number.isInteger(value.maxEntries) ? value.maxEntries : 0;
                definition.fields = Array.isArray(value.fields) ? value.fields : [];
                definition.permanent = value.permanent === true;
            }
        }
        catch
        {
            // Metadata is optional so legacy or malformed trailing data cannot break the base packet.
        }
    }

    public get roomId(): number
    {
        return this._roomId;
    }

    public get definitions(): IWiredUserVariableDefinitionData[]
    {
        return this._definitions;
    }

    public get users(): IWiredUserVariablesUserData<T>[]
    {
        return this._users;
    }

    public get furniDefinitions(): IWiredFurniVariableDefinitionData[]
    {
        return this._furniDefinitions;
    }

    public get furnis(): IWiredUserVariablesFurniData<T>[]
    {
        return this._furnis;
    }

    public get roomDefinitions(): IWiredRoomVariableDefinitionData[]
    {
        return this._roomDefinitions;
    }

    public get roomAssignments(): IWiredRoomVariableAssignmentData<T>[]
    {
        return this._roomAssignments;
    }

    public get contextDefinitions(): IWiredContextVariableDefinitionData[]
    {
        return this._contextDefinitions;
    }
}
