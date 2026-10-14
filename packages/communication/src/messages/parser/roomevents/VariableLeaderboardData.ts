import { IMessageDataWrapper } from '@volt/api';
import { readWiredInt64 } from './WiredInt64';

/** package_160.class_3745: one leaderboard column. Types: 0 username, 1 value, 2 last update, 3 creation, 4 level, 5 text connection. */
export interface IVariableLeaderboardColumn
{
    type: number;
    label: string;
    /** 0 small, 1 medium, 2 large, 3 extra large. */
    width: number;
}

/** package_160.class_3199: a variable the viewer can switch to. */
export interface IVariableLeaderboardChoice
{
    variableId: string;
    displayName: string;
}

/** package_160.class_3225: where the overlay is anchored. */
export interface IVariableLeaderboardLocation
{
    tileX: number;
    tileY: number;
    offsetX: number;
    altitude: number;
}

/** package_160.class_2737: one published leaderboard overlay. */
export interface IVariableLeaderboardDescriptor
{
    overlayInstanceId: number;
    queryRevision: number;
    title: string;
    description: string;
    location: IVariableLeaderboardLocation;
    sortMode: number;
    columns: IVariableLeaderboardColumn[];
    choices: IVariableLeaderboardChoice[];
    defaultVariableId: string;
    /** Index into [10, 15, 20]. */
    pageSizeOption: number;
}

/** package_160.class_3133: one row of a chunk. Times are epoch milliseconds read as longs. */
export interface IVariableLeaderboardRow
{
    rank: number;
    userId: number;
    username: string;
    figure: string;
    rawValue: string;
    creationTime: number;
    lastUpdateTime: number;
    levelAvailable: boolean;
    level: string;
    textConnectionAvailable: boolean;
    textConnection: string;
}

/** class_2737.fromMessage (L48-83, WIN63-202610131318); null when the column or choice count is out of range. */
export function parseVariableLeaderboardDescriptor(wrapper: IMessageDataWrapper): IVariableLeaderboardDescriptor
{
    const overlayInstanceId = wrapper.readInt();
    const queryRevision = wrapper.readInt();
    const title = wrapper.readString();
    const description = wrapper.readString();
    const location = { tileX: wrapper.readInt(), tileY: wrapper.readInt(), offsetX: wrapper.readInt(), altitude: wrapper.readInt() };
    const sortMode = wrapper.readInt();
    const columnCount = wrapper.readInt();

    if((columnCount < 1) || (columnCount > 4)) return null;

    const columns: IVariableLeaderboardColumn[] = [];

    for(let i = 0; i < columnCount; i++) columns.push({ type: wrapper.readInt(), label: wrapper.readString(), width: wrapper.readInt() });

    const choiceCount = wrapper.readInt();

    if((choiceCount < 0) || (choiceCount > 10)) return null;

    const choices: IVariableLeaderboardChoice[] = [];

    for(let i = 0; i < choiceCount; i++) choices.push({ variableId: wrapper.readString(), displayName: wrapper.readString() });

    const defaultVariableId = wrapper.readString();
    const pageSizeOption = wrapper.readInt();

    return { overlayInstanceId, queryRevision, title, description, location, sortMode, columns, choices, defaultVariableId, pageSizeOption };
}

/** class_3133.fromMessage (L47-61, WIN63-202610131318). */
export function parseVariableLeaderboardRow(wrapper: IMessageDataWrapper): IVariableLeaderboardRow
{
    const rank = wrapper.readInt();
    const userId = wrapper.readInt();
    const username = wrapper.readString();
    const figure = wrapper.readString();
    const rawValue = wrapper.readString();
    const creationTime = Number(readWiredInt64(wrapper));
    const lastUpdateTime = Number(readWiredInt64(wrapper));
    const levelAvailable = wrapper.readBoolean();
    const level = levelAvailable ? wrapper.readString() : null;
    const textConnectionAvailable = wrapper.readBoolean();
    const textConnection = textConnectionAvailable ? wrapper.readString() : null;

    return { rank, userId, username, figure, rawValue, creationTime, lastUpdateTime, levelAvailable, level, textConnectionAvailable, textConnection };
}
