import { IMessageDataWrapper } from '@volt/api';
import { IWiredVariableData } from './WiredVariableData';

/** Strict, purpose-specific catalog reader; holder and other context readers retain their own ABI. */
export function readNativeCatalogBoolean(wrapper: IMessageDataWrapper): boolean
{
    const value = wrapper.readByte();
    if(value !== 0 && value !== 1) throw new Error('Invalid catalog boolean');
    return value === 1;
}

export function readNativeCatalogCount(wrapper: IMessageDataWrapper, maximum = 4096): number
{
    const count = wrapper.readInt();
    if(!Number.isInteger(count) || count < 0 || count > maximum) throw new Error('Invalid catalog count');
    return count;
}

export function readNativeCatalogId(wrapper: IMessageDataWrapper): string
{
    const id = wrapper.readString();
    if(!id || id.length > 64) throw new Error('Invalid catalog ID');
    return id;
}

export function nativeCatalogAtEnd(wrapper: IMessageDataWrapper): boolean
{
    return wrapper.remainingBytes === 0 || (wrapper.remainingBytes === undefined && wrapper.bytesAvailable === false);
}

export function parseNativeWiredVariable(wrapper: IMessageDataWrapper): IWiredVariableData
{
    const variableId = readNativeCatalogId(wrapper);
    const variableType = wrapper.readInt();
    const variableName = wrapper.readString();
    const availabilityType = wrapper.readInt();
    const variableTarget = wrapper.readInt();
    if(![0, 1, 2, 3].includes(variableType) || !Number.isInteger(availabilityType)
        || ![0, 1, -10, -20].includes(variableTarget) || !variableName || variableName.length > 1000)
        throw new Error('Invalid catalog variable');
    const alwaysAvailable = readNativeCatalogBoolean(wrapper);
    const canCreateAndDelete = readNativeCatalogBoolean(wrapper);
    const hasValue = readNativeCatalogBoolean(wrapper);
    const canWriteValue = readNativeCatalogBoolean(wrapper);
    const canInterceptChanges = readNativeCatalogBoolean(wrapper);
    const isInvisible = readNativeCatalogBoolean(wrapper);
    const requiresExecutionContext = readNativeCatalogBoolean(wrapper);
    const canReadCreationTime = readNativeCatalogBoolean(wrapper);
    const canReadLastUpdateTime = readNativeCatalogBoolean(wrapper);
    let textConnector: { key: number; value: string }[] = null;
    let hasTextConnectorFallback = false;
    let textConnectorFallback: string = null;
    if(readNativeCatalogBoolean(wrapper))
    {
        textConnector = [];
        const count = readNativeCatalogCount(wrapper);
        const keys = new Set<number>();
        for(let index = 0; index < count; index++)
        {
            const key = wrapper.readInt();
            const value = wrapper.readString();
            if(keys.has(key)) throw new Error('Duplicate catalog connector key');
            keys.add(key);
            textConnector.push(Object.freeze({ key, value }));
        }
        Object.freeze(textConnector);
        hasTextConnectorFallback = readNativeCatalogBoolean(wrapper);
        if(hasTextConnectorFallback) textConnectorFallback = wrapper.readString();
    }
    return Object.freeze({ variableId, variableType, variableName, availabilityType, variableTarget,
        alwaysAvailable, canCreateAndDelete, hasValue, canWriteValue, canInterceptChanges, isInvisible,
        canReadCreationTime, canReadLastUpdateTime, requiresExecutionContext, textConnector,
        hasTextConnectorFallback, textConnectorFallback });
}
