import { IMessageDataWrapper } from '@octane/api';

/**
 * One October AIR variable record (`package_223.WiredVariable`).
 */
export interface IWiredVariableData
{
    variableId: string;
    variableType: number;
    variableName: string;
    availabilityType: number;
    variableTarget: number;
    alwaysAvailable: boolean;
    canCreateAndDelete: boolean;
    hasValue: boolean;
    canWriteValue: boolean;
    canInterceptChanges: boolean;
    isInvisible: boolean;
    canReadCreationTime: boolean;
    canReadLastUpdateTime: boolean;
    requiresExecutionContext: boolean;
    textConnector: { key: number; value: string }[] | null;
    hasTextConnectorFallback: boolean;
    textConnectorFallback: string | null;
}

/** Reads the official `WiredVariable` block from the wrapper. */
export function parseWiredVariableData(wrapper: IMessageDataWrapper): IWiredVariableData
{
    const variableId = wrapper.readString();
    const variableType = wrapper.readInt();
    const variableName = wrapper.readString();
    const availabilityType = wrapper.readInt();
    const variableTarget = wrapper.readInt();
    const alwaysAvailable = wrapper.readBoolean();
    const canCreateAndDelete = wrapper.readBoolean();
    const hasValue = wrapper.readBoolean();
    const canWriteValue = wrapper.readBoolean();
    const canInterceptChanges = wrapper.readBoolean();
    const isInvisible = wrapper.readBoolean();
    const requiresExecutionContext = wrapper.readBoolean();
    const canReadCreationTime = wrapper.readBoolean();
    const canReadLastUpdateTime = wrapper.readBoolean();

    let textConnector: { key: number; value: string }[] = null;
    let hasTextConnectorFallback = false;
    let textConnectorFallback: string = null;

    if(wrapper.readBoolean())
    {
        textConnector = [];

        const totalConnectors = wrapper.readInt();

        for(let i = 0; i < totalConnectors; i++)
        {
            const key = wrapper.readInt();
            const value = wrapper.readString();

            textConnector.push({ key, value });
        }

        hasTextConnectorFallback = wrapper.readBoolean();
        if(hasTextConnectorFallback) textConnectorFallback = wrapper.readString();
    }

    return {
        variableId,
        variableType,
        variableName,
        availabilityType,
        variableTarget,
        alwaysAvailable,
        canCreateAndDelete,
        hasValue,
        canWriteValue,
        canInterceptChanges,
        isInvisible,
        canReadCreationTime,
        canReadLastUpdateTime,
        requiresExecutionContext,
        textConnector,
        hasTextConnectorFallback,
        textConnectorFallback
    };
}

/** The wire uses two 32-bit halves for every `long`, exactly like the official client. */
export function readWiredLong(wrapper: IMessageDataWrapper): number
{
    const high = wrapper.readInt() >>> 0;
    const low = wrapper.readInt() >>> 0;

    return (high * 0x100000000) + low;
}

/** A signed `long` sent as two 32-bit halves; the high half carries the sign. */
export function readWiredSignedLong(wrapper: IMessageDataWrapper): number
{
    const high = wrapper.readInt();
    const low = wrapper.readInt() >>> 0;

    return (high * 0x100000000) + low;
}
