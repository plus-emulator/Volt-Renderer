import { decodeApngImage } from './ApngImageDecoder';
import { decodeGifImage } from './GifImageDecoder';
import { ImageFormat } from './ImageFormat';
import { detectImageFormat } from './ImageFormatDetector';
import { LoadedImageResource } from './ImageResource';
import { decodeStaticImage } from './StaticImageDecoder';
import { decodeAnimatedWebPImage } from './WebPImageDecoder';

export interface ImageLoadRequest
{
    source: string;
    bytes?: ArrayBuffer | Uint8Array;
    contentType?: string;
    allowAnimation?: boolean;
}

export interface ImageFetchResponse
{
    ok: boolean;
    status: number;
    headers?: Pick<Headers, 'get'>;
    arrayBuffer?(): Promise<ArrayBuffer>;
}

export interface ImageLoaderDependencies
{
    fetch(source: string): Promise<ImageFetchResponse>;
    decodeStatic(bytes: Uint8Array, format: ImageFormat, source: string): Promise<LoadedImageResource>;
    decodeGif(bytes: Uint8Array): LoadedImageResource;
    decodeApng(bytes: Uint8Array): Promise<LoadedImageResource>;
    decodeAnimatedWebP(bytes: Uint8Array): Promise<LoadedImageResource>;
    warn(message: string): void;
}

export const loadImageResource = async (
    request: ImageLoadRequest,
    dependencies: ImageLoaderDependencies = DEFAULT_DEPENDENCIES
): Promise<LoadedImageResource> =>
{
    const source = request.source?.trim();

    if(!source) throw new Error('Image loading failed: the source is empty');

    const fetched = request.bytes === undefined
        ? await fetchImageBytes(source, dependencies)
        : { bytes: toBytes(request.bytes), contentType: request.contentType };
    const contentType = request.contentType ?? fetched.contentType;
    const detected = detectImageFormat(fetched.bytes, contentType, source);

    if(detected.format === 'unknown')
        throw new Error(`Image loading failed for "${ source }": unsupported image format`);

    if(detected.animated && request.allowAnimation === false)
        throw new Error(`Image loading failed for "${ source }" (${ detected.format }): animated images cannot provide a stable atlas texture`);

    if(!detected.animated)
        return decodeStaticWithContext(fetched.bytes, detected.format, source, dependencies);

    try
    {
        switch(detected.format)
        {
            case 'gif':
                return dependencies.decodeGif(fetched.bytes);
            case 'png':
                return await dependencies.decodeApng(fetched.bytes);
            case 'webp':
                return await dependencies.decodeAnimatedWebP(fetched.bytes);
            default:
                return decodeStaticWithContext(fetched.bytes, detected.format, source, dependencies);
        }
    }
    catch (animationError)
    {
        const animationReason = errorMessage(animationError);

        try
        {
            const resource = await dependencies.decodeStatic(fetched.bytes, detected.format, source);

            dependencies.warn(`Animated ${ detected.format.toUpperCase() } decoding failed for "${ source }"; using a static first frame: ${ animationReason }`);

            return resource;
        }
        catch (staticError)
        {
            throw new Error(`Image loading failed for "${ source }" (${ detected.format }): animated decoder failed (${ animationReason}); static fallback failed (${ errorMessage(staticError) })`);
        }
    }
};

const decodeBase64 = (encoded: string): Uint8Array =>
{
    const fromBase64 = (Uint8Array as unknown as { fromBase64?: (input: string) => Uint8Array }).fromBase64;

    if(typeof fromBase64 === 'function') return fromBase64(encoded);

    const binary = globalThis.atob(encoded);
    const bytes = new Uint8Array(binary.length);

    for(let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    return bytes;
};

const tryDecodeDataUrl = (source: string): { bytes: Uint8Array; contentType?: string } | null =>
{
    if(!source.startsWith('data:')) return null;

    const commaIndex = source.indexOf(',');

    if(commaIndex < 0) return null;

    const meta = source.slice(5, commaIndex);

    if(!meta.endsWith(';base64')) return null;

    const contentType = meta.slice(0, -7) || undefined;
    const payload = source.slice(commaIndex + 1);

    try
    {
        return { bytes: decodeBase64(payload), contentType };
    }
    catch
    {
        return null;
    }
};

const fetchImageBytes = async (source: string, dependencies: ImageLoaderDependencies): Promise<{ bytes: Uint8Array; contentType?: string }> =>
{
    if(dependencies.fetch === DEFAULT_DEPENDENCIES.fetch)
    {
        const inline = tryDecodeDataUrl(source);

        if(inline) return inline;
    }

    let response: ImageFetchResponse;

    try
    {
        const cache = (dependencies.fetch === DEFAULT_DEPENDENCIES.fetch)
            ? (globalThis as { __voltPrefetchCache?: Map<string, Promise<Response>> }).__voltPrefetchCache
            : undefined;
        const prefetched = cache?.get(source);

        if(prefetched) cache.delete(source);

        response = await (prefetched ?? dependencies.fetch(source));
    }
    catch (error)
    {
        throw new Error(`Image loading failed for "${ source }" during fetch: ${ errorMessage(error) }`);
    }

    if(!response.ok) throw new Error(`Image loading failed for "${ source }": HTTP ${ response.status }`);
    if(!response.arrayBuffer) throw new Error(`Image loading failed for "${ source }": the response has no readable body`);

    try
    {
        return {
            bytes: new Uint8Array(await response.arrayBuffer()),
            contentType: response.headers?.get('Content-Type') ?? undefined
        };
    }
    catch (error)
    {
        throw new Error(`Image loading failed for "${ source }" while reading the response: ${ errorMessage(error) }`);
    }
};

const decodeStaticWithContext = async (
    bytes: Uint8Array,
    format: ImageFormat,
    source: string,
    dependencies: ImageLoaderDependencies
): Promise<LoadedImageResource> =>
{
    try
    {
        return await dependencies.decodeStatic(bytes, format, source);
    }
    catch (error)
    {
        throw new Error(`Image loading failed for "${ source }" (${ format }) during static decode: ${ errorMessage(error) }`);
    }
};

// Read-only from here on: the bytes are sniffed for a format and handed to a decoder that copies
// them into a blob, so a view over what the caller gave us is enough and a copy is pure cost.
const toBytes = (bytes: ArrayBuffer | Uint8Array): Uint8Array => bytes instanceof Uint8Array
    ? bytes
    : new Uint8Array(bytes);

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error);

const DEFAULT_DEPENDENCIES: ImageLoaderDependencies = {
    fetch: source => globalThis.fetch(source),
    decodeStatic: decodeStaticImage,
    decodeGif: decodeGifImage,
    decodeApng: decodeApngImage,
    decodeAnimatedWebP: decodeAnimatedWebPImage,
    warn: message => console.warn(message)
};
