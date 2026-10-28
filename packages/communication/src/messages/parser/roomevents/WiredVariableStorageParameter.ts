import { IMessageDataWrapper } from '@volt/api';

export interface IWiredVariableTimedValue
{
    value: number;
    created: number;
    createdText: string;
    updated: number;
    updatedText: string;
}

function readLong(wrapper: IMessageDataWrapper): number
{
    const high = wrapper.readInt();
    const low = wrapper.readInt();

    return (high * 0x100000000) + (low >>> 0);
}

export function readWiredVariableStorage(wrapper: IMessageDataWrapper): IWiredVariableTimedValue
{
    const value = wrapper.readInt();
    const created = readLong(wrapper);
    const createdText = wrapper.readString();
    const updated = readLong(wrapper);
    const updatedText = wrapper.readString();

    return Object.freeze({ value, created, createdText, updated, updatedText });
}
