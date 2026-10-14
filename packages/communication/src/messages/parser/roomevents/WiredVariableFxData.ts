import { IMessageDataWrapper } from '@volt/api';
import { readWiredInt64 } from './WiredInt64';

/** How one variable fx is drawn; statuses point at it by `configId` (the fx box's item id). */
export interface IWiredVariableFxConfig
{
    configId: number;
    userFx: boolean;
    showMode: number;
    updateMask: number;
    showOnMouseHover: boolean;
    showDurationMs: number;
    category: number;
    styleId: number;
    colorId: number;
    widthId: number;
    rendererId: number;
    defaultMinValue: bigint | number;
    defaultMaxValue: bigint | number;
    extra: Record<string, string>;
}

/** The value one fx shows over one avatar (room unit id) or floor furni (item id). */
export interface IWiredVariableFxStatus
{
    configId: number;
    variableId: string;
    initialize: boolean;
    userEntity: boolean;
    entityId: number;
    value: bigint | number;
    overrideMinValue: bigint | number | null;
    overrideMaxValue: bigint | number | null;
    extra: Record<string, string>;
}

/** The status removal key the server sends: `configId|variableId|u/f|entityId`. */
export interface IWiredVariableFxStatusKey
{
    configId: number;
    variableId: string;
    userEntity: boolean;
    entityId: number;
}

export function wiredVariableFxStatusKey(status: IWiredVariableFxStatusKey): string
{
    return `${ status.configId }|${ status.variableId }|${ status.userEntity ? 'u' : 'f' }|${ status.entityId }`;
}

export function readWiredVariableFxExtra(wrapper: IMessageDataWrapper): Record<string, string>
{
    const extra: Record<string, string> = {};
    const count = wrapper.readInt();

    for(let i = 0; i < count; i++)
    {
        const key = wrapper.readString();

        extra[key] = wrapper.readString();
    }

    return extra;
}

export function readWiredVariableFxConfig(wrapper: IMessageDataWrapper): IWiredVariableFxConfig
{
    return {
        configId: wrapper.readInt(),
        userFx: wrapper.readBoolean(),
        showMode: wrapper.readInt(),
        updateMask: wrapper.readInt(),
        showOnMouseHover: wrapper.readBoolean(),
        showDurationMs: wrapper.readInt(),
        category: wrapper.readInt(),
        styleId: wrapper.readInt(),
        colorId: wrapper.readInt(),
        widthId: wrapper.readInt(),
        rendererId: wrapper.readInt(),
        defaultMinValue: readWiredInt64(wrapper),
        defaultMaxValue: readWiredInt64(wrapper),
        extra: readWiredVariableFxExtra(wrapper)
    };
}

export function readWiredVariableFxStatus(wrapper: IMessageDataWrapper): IWiredVariableFxStatus
{
    const configAndVariable = wrapper.readString();
    const separator = configAndVariable.indexOf('|');
    const configId = parseInt(separator >= 0 ? configAndVariable.substring(0, separator) : configAndVariable, 10);
    const variableId = separator >= 0 ? configAndVariable.substring(separator + 1) : '';
    const initialize = wrapper.readBoolean();
    const userEntity = wrapper.readBoolean();
    const entityId = wrapper.readInt();
    const value = readWiredInt64(wrapper);
    const hasOverrides = wrapper.readBoolean();
    const overrideMinValue = hasOverrides ? readWiredInt64(wrapper) : null;
    const overrideMaxValue = hasOverrides ? readWiredInt64(wrapper) : null;
    const extra = readWiredVariableFxExtra(wrapper);

    return {
        configId: Number.isNaN(configId) ? 0 : configId,
        variableId,
        initialize,
        userEntity,
        entityId,
        value,
        overrideMinValue,
        overrideMaxValue,
        extra
    };
}

/** Splits a removal key back into its parts; null for a key that is not four fields. */
export function parseWiredVariableFxStatusKey(key: string): IWiredVariableFxStatusKey
{
    const parts = key.split('|');

    if(parts.length < 4) return null;

    // The variable id is `type:id`; only the outer fields carry '|'.
    const entityId = parseInt(parts[parts.length - 1], 10);
    const userEntity = parts[parts.length - 2] === 'u';
    const configId = parseInt(parts[0], 10);
    const variableId = parts.slice(1, parts.length - 2).join('|');

    if(Number.isNaN(configId) || Number.isNaN(entityId)) return null;

    return { configId, variableId, userEntity, entityId };
}
