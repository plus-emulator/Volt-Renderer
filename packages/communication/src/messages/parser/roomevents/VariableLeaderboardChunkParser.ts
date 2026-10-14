import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { IVariableLeaderboardRow, parseVariableLeaderboardRow } from './VariableLeaderboardData';

/** package_135.class_3018 (in 3979 in WIN63-202610131318): one chunk of at most 50 rows of an overlay. */
export class VariableLeaderboardChunkParser implements IMessageParser
{
    public static readonly CHUNK_SIZE = 50;

    private _overlayInstanceId = 0;
    private _queryRevision = 0;
    private _selectedVariableId = '';
    private _chunkIndex = 0;
    private _totalCount = 0;
    private _rows: IVariableLeaderboardRow[] = [];

    public flush(): boolean
    {
        this._overlayInstanceId = 0;
        this._queryRevision = 0;
        this._selectedVariableId = '';
        this._chunkIndex = 0;
        this._totalCount = 0;
        this._rows = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._overlayInstanceId = wrapper.readInt();
        this._queryRevision = wrapper.readInt();
        this._selectedVariableId = wrapper.readString();
        this._chunkIndex = wrapper.readInt();
        this._totalCount = wrapper.readInt();

        const count = wrapper.readInt();

        if((this._chunkIndex < 0) || (this._totalCount < 0) || (count < 0) || (count > VariableLeaderboardChunkParser.CHUNK_SIZE)) return false;

        const rows: IVariableLeaderboardRow[] = [];

        for(let i = 0; i < count; i++) rows.push(parseVariableLeaderboardRow(wrapper));

        this._rows = rows;

        return true;
    }

    public get overlayInstanceId(): number
    {
        return this._overlayInstanceId;
    }

    public get queryRevision(): number
    {
        return this._queryRevision;
    }

    public get selectedVariableId(): string
    {
        return this._selectedVariableId;
    }

    public get chunkIndex(): number
    {
        return this._chunkIndex;
    }

    public get totalCount(): number
    {
        return this._totalCount;
    }

    public get rows(): IVariableLeaderboardRow[]
    {
        return this._rows;
    }
}
