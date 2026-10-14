import { IMessageDataWrapper } from '@volt/api';

const MIN = -(1n << 63n);
const MAX = (1n << 63n) - 1n;

/** Parse before changing UI state; never convert an unsafe Number into a scalar. */
export function parseWiredInt64(value: bigint | string | number): bigint
{
    if(typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'bigint') throw new RangeError('Enter an exact whole number.');
    if(typeof value === 'number' && !Number.isSafeInteger(value)) throw new RangeError('Enter an exact whole number.');
    if(typeof value === 'string' && !/^[+-]?\d+$/.test(value.trim())) throw new RangeError('Enter an exact whole number.');
    const result = BigInt(typeof value === 'string' ? value.trim() : value);
    if(result < MIN || result > MAX) throw new RangeError('Value must fit a signed 64-bit integer.');
    return result;
}

export function wiredInt64Parts(value: bigint | string | number): [number, number]
{
    const parsed = parseWiredInt64(value);
    return [ Number(BigInt.asIntN(32, parsed >> 32n)), Number(BigInt.asIntN(32, parsed)) ];
}

export function readWiredInt64(wrapper: IMessageDataWrapper): bigint
{
    return (BigInt(wrapper.readInt()) << 32n) | BigInt(wrapper.readInt() >>> 0);
}
