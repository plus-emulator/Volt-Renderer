import { IMessageDataWrapper } from '@octane/api';
import { IWiredVariableData, parseWiredVariableData } from './WiredVariableData';

export function readWiredCount(wrapper: IMessageDataWrapper, maximum = 10000): number
{
    const count = wrapper.readInt();
    if(count < 0 || count > maximum) throw new Error('Invalid Wired count');
    return count;
}

export function readWiredInts(wrapper: IMessageDataWrapper, maximum = 10000): number[]
{
    return Array.from({ length: readWiredCount(wrapper, maximum) }, () => wrapper.readInt());
}

export function readWiredBoolean(wrapper: IMessageDataWrapper): boolean
{
    const value = wrapper.readByte();
    if(value !== 0 && value !== 1) throw new Error('Invalid Wired boolean');
    return value === 1;
}

export interface WiredInputSourcesConfiguration
{
    furniAllowed: number[][];
    usersAllowed: number[][];
    furniDefaults: number[];
    userDefaults: number[];
}

export type WiredEditorContext =
    | { type: 0; hash: number }
    | { type: 1 | 2; variable: IWiredVariableData; holders: { objectId: number; value: number }[] }
    | { type: 3; variable: IWiredVariableData; value: number }
    | { type: 4; shared: { roomId: number; roomName: string; variable: IWiredVariableData }[] }
    | { type: 5; variables: IWiredVariableData[] }
    | { type: 6; placeholders: { roomId: number; roomName: string; name: string }[] }
    | { type: 7; placeholderNames: string[]; capturerNames: string[] };

export function readWiredContexts(wrapper: IMessageDataWrapper): WiredEditorContext[]
{
    return Array.from({ length: readWiredCount(wrapper, 9) }, () =>
    {
        const type = wrapper.readInt();
        switch(type)
        {
            case 0: return { type, hash: wrapper.readInt() };
            case 1:
            case 2:
            {
                const variable = parseWiredVariableData(wrapper);
                const holders = Array.from({ length: readWiredCount(wrapper) }, () => ({ objectId: wrapper.readInt(), value: wrapper.readInt() }));
                return { type, variable, holders };
            }
            case 3: return { type, variable: parseWiredVariableData(wrapper), value: wrapper.readInt() };
            case 4:
            {
                const shared = Array.from({ length: readWiredCount(wrapper) }, () => ({ roomId: wrapper.readInt(), roomName: wrapper.readString(), variable: parseWiredVariableData(wrapper) }));
                return { type, shared };
            }
            case 5: return { type, variables: Array.from({ length: readWiredCount(wrapper) }, () => parseWiredVariableData(wrapper)) };
            case 6:
            {
                const placeholders = Array.from({ length: readWiredCount(wrapper) }, () => ({ roomId: wrapper.readInt(), roomName: wrapper.readString(), name: wrapper.readString() }));
                return { type, placeholders };
            }
            // The message editors' text placeholders: the names "add placeholder" offers, then the stack's capturers.
            case 7:
            {
                const placeholderNames = Array.from({ length: readWiredCount(wrapper) }, () => wrapper.readString());
                const capturerNames = Array.from({ length: readWiredCount(wrapper) }, () => wrapper.readString());
                return { type, placeholderNames, capturerNames };
            }
            default: throw new Error('Unsupported Wired context');
        }
    });
}
