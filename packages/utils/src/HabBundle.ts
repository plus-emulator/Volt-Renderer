import { inflate } from 'pako';
import { Texture } from 'pixi.js';
import { VoltBundleTextureDecoder } from './VoltBundle';

const HAB_MAGIC = 'HAB\0';
const HAB_VERSION = 1;
const HAB_FLAGS = 1;
const HAB_HEADER_LENGTH = 20;
const HAB_MAX_INDEX_LENGTH = 64 * 1024 * 1024;
const HAB_MAX_ENTRIES = 100000;
const NATIVE_INFLATE_MIN_BYTES = 4096;

const inflateBytes = async (stored: Uint8Array): Promise<Uint8Array> =>
{
    if((stored.byteLength >= NATIVE_INFLATE_MIN_BYTES) && (typeof DecompressionStream === 'function') && (typeof Response === 'function'))
    {
        try
        {
            const stream = new Response(stored as BodyInit).body?.pipeThrough(new DecompressionStream('deflate'));

            if(stream) return new Uint8Array(await new Response(stream).arrayBuffer());
        }
        catch {}
    }

    return inflate(stored);
};

interface HabEntry
{
    name: string;
    mimeType: string;
    offset: number;
    storedLength: number;
    originalLength: number;
    compression: 'none' | 'deflate';
}

/**
 * A Habbo `.hab` asset bundle: a 20-byte little-endian header ("HAB\0", version, flags and three
 * lengths), a deflated JSON index, then the entries back to back. Reads and validates it the way the
 * official Habbo client does. Entries the writer could not shrink are stored raw, so a PNG usually
 * reaches the texture decoder without being inflated.
 */
export class HabBundle
{
    private static TEXT_DECODER: TextDecoder = new TextDecoder('utf-8');

    private _jsonFile: object = null;
    private _texture: Texture = null;

    public static async from(buffer: ArrayBuffer, textureDecoder: VoltBundleTextureDecoder): Promise<HabBundle>
    {
        const bundle = new HabBundle();

        await bundle.parse(buffer, textureDecoder);

        return bundle;
    }

    public async parse(buffer: ArrayBuffer, textureDecoder: VoltBundleTextureDecoder): Promise<void>
    {
        const bytes = new Uint8Array(buffer);

        if(bytes.byteLength < HAB_HEADER_LENGTH) throw new Error('HAB asset bundle is shorter than its header.');
        if(HabBundle.TEXT_DECODER.decode(bytes.subarray(0, 4)) !== HAB_MAGIC) throw new Error('HAB asset bundle has an invalid magic signature.');

        const view = new DataView(buffer);
        const version = view.getUint16(4, true);
        const flags = view.getUint16(6, true);
        const indexStoredLength = view.getUint32(8, true);
        const indexOriginalLength = view.getUint32(12, true);
        const payloadLength = view.getUint32(16, true);

        if(version !== HAB_VERSION) throw new Error(`Unsupported HAB asset bundle version ${ version }.`);
        if(flags !== HAB_FLAGS) throw new Error(`Unsupported HAB asset bundle flags 0x${ flags.toString(16) }.`);
        if(indexOriginalLength > HAB_MAX_INDEX_LENGTH) throw new Error(`HAB asset bundle index exceeds the ${ HAB_MAX_INDEX_LENGTH }-byte safety limit.`);

        const payloadStart = HAB_HEADER_LENGTH + indexStoredLength;
        const expectedLength = payloadStart + payloadLength;

        if(expectedLength !== bytes.byteLength) throw new Error(`HAB asset bundle length mismatch: expected ${ expectedLength }, received ${ bytes.byteLength }.`);

        const indexBytes = await inflateBytes(bytes.subarray(HAB_HEADER_LENGTH, payloadStart));

        if(indexBytes.byteLength !== indexOriginalLength) throw new Error(`HAB asset bundle index length mismatch: expected ${ indexOriginalLength }, decoded ${ indexBytes.byteLength }.`);

        const entries = readIndex(HabBundle.TEXT_DECODER.decode(indexBytes), payloadLength);
        const payload = bytes.subarray(payloadStart);

        const decodedEntries = await Promise.all(entries.map(async entry =>
        {
            const stored = payload.subarray(entry.offset, entry.offset + entry.storedLength);
            const data = (entry.compression === 'deflate') ? await inflateBytes(stored) : stored;

            if(data.byteLength !== entry.originalLength) throw new Error(`HAB entry "${ entry.name }" length mismatch: expected ${ entry.originalLength }, decoded ${ data.byteLength }.`);

            return { entry, data };
        }));

        // Parse JSON entries before decoding textures so a JSON error never leaks an allocated texture,
        // and decode image entries in index order so multi-image bundles stay deterministic.
        for(const { entry, data } of decodedEntries)
        {
            if(entry.mimeType === 'application/json')
            {
                this._jsonFile = JSON.parse(HabBundle.TEXT_DECODER.decode(data));
            }
        }

        for(const { entry, data } of decodedEntries)
        {
            if(entry.mimeType.startsWith('image/'))
            {
                this._texture = await textureDecoder(ownBuffer(data), entry.name);
            }
        }
    }

    public get jsonFile(): object
    {
        return this._jsonFile;
    }

    public get texture(): Texture
    {
        return this._texture;
    }
}

const readIndex = (text: string, payloadLength: number): HabEntry[] =>
{
    let index: { format?: unknown; version?: unknown; entries?: unknown };

    try
    {
        index = JSON.parse(text);
    }
    catch (error)
    {
        throw new Error(`Failed to parse HAB asset bundle index: ${ error instanceof Error ? error.message : String(error) }`);
    }

    if(index?.format !== 'hab' || index.version !== HAB_VERSION || !Array.isArray(index.entries)) throw new Error('HAB asset bundle index has an invalid format or version.');
    if(index.entries.length > HAB_MAX_ENTRIES) throw new Error(`HAB asset bundle exceeds the ${ HAB_MAX_ENTRIES }-entry safety limit.`);

    const names = new Set<string>();

    for(const entry of index.entries as HabEntry[])
    {
        if(!entry || (typeof entry.name !== 'string') || !entry.name.length || (typeof entry.mimeType !== 'string')) throw new Error('HAB asset bundle contains an invalid entry descriptor.');
        if(names.has(entry.name)) throw new Error(`HAB asset bundle contains duplicate entry "${ entry.name }".`);

        names.add(entry.name);

        if((entry.compression !== 'none') && (entry.compression !== 'deflate')) throw new Error(`HAB entry "${ entry.name }" uses unsupported compression "${ String(entry.compression) }".`);
        if(!isSafeLength(entry.offset) || !isSafeLength(entry.storedLength) || !isSafeLength(entry.originalLength)) throw new Error(`HAB entry "${ entry.name }" contains an invalid offset or length.`);
        if((entry.offset + entry.storedLength) > payloadLength) throw new Error(`HAB entry "${ entry.name }" exceeds the payload boundary.`);
    }

    return index.entries as HabEntry[];
};

const isSafeLength = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;

/** The bytes as their own buffer, which the texture decoders take. */
const ownBuffer = (bytes: Uint8Array): ArrayBuffer =>
    (bytes.byteOffset === 0) && (bytes.byteLength === bytes.buffer.byteLength)
        ? bytes.buffer as ArrayBuffer
        : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
