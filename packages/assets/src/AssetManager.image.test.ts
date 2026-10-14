import { describe, expect, it, vi } from 'vitest';
import { AssetManager } from './AssetManager';

const createResource = (texture: object = { label: '' }) => ({
    texture,
    format: 'webp' as const,
    animated: false,
    dispose: vi.fn()
});

const createManager = (overrides: Record<string, unknown> = {}) =>
{
    const dependencies = {
        fetch: vi.fn(),
        parseAssetData: vi.fn(),
        loadImageResource: vi.fn(),
        loadVoltBundle: vi.fn(),
        loadHabBundle: vi.fn(),
        bundleFormat: () => 'nitro' as const,
        ...overrides
    };
    const manager = new AssetManager(dependencies);

    return { manager, dependencies };
};

describe('AssetManager modern image loading', () =>
{
    it.each(['room', 'floor_editor'])('decodes %s images concurrently and defines the collection only after all complete', async name =>
    {
        const completions: (() => void)[] = [];
        const collection = { textures: new Map(), define: vi.fn() };
        const { manager, dependencies } = createManager({
            loadImageResource: vi.fn(() => new Promise(resolve => completions.push(() => resolve(createResource()))))
        });
        vi.spyOn(manager as any, 'createCollection').mockReturnValue(collection);
        const loading = name === 'room' ? (manager as any).loadLocalRoom() : (manager as any).loadLocalAsset(name);

        await vi.waitFor(() => expect(completions.length).toBeGreaterThan(1));
        const count = completions.length;
        completions.slice(1).forEach(complete => complete());
        await Promise.resolve();
        expect(collection.define).not.toHaveBeenCalled();
        completions[0]();
        await loading;
        expect(dependencies.loadImageResource).toHaveBeenCalledTimes(count);
        expect(collection.define).toHaveBeenCalledTimes(1);
        expect(collection.textures.size).toBeGreaterThanOrEqual(count);
    });

    it('routes a direct WebP URL with query parameters through the central image loader', async () =>
    {
        const resource = createResource();
        const { manager, dependencies } = createManager({
            loadImageResource: vi.fn().mockResolvedValue(resource)
        });
        const source = 'https://cdn.example/furni/preview.WEBP?v=42';

        await manager.downloadAsset(source);

        expect(dependencies.loadImageResource).toHaveBeenCalledWith({ source });
        expect(manager.getTexture(source)).toBe(resource.texture);
    });

    it('supports extensionless image URLs through the same loader', async () =>
    {
        const resource = createResource();
        const { manager, dependencies } = createManager({
            loadImageResource: vi.fn().mockResolvedValue(resource)
        });
        const source = 'https://cdn.example/image/219';

        await manager.downloadAsset(source);

        expect(dependencies.loadImageResource).toHaveBeenCalledWith({ source });
        expect(manager.getTexture(source)).toBe(resource.texture);
    });

    it('loads JSON spritesheets as non-animated atlas images', async () =>
    {
        const resource = createResource();
        const response = { ok: true, status: 200 };
        const data = {
            name: 'modern_chair',
            spritesheet: { meta: { image: 'modern_chair.webp' } }
        };
        const { manager, dependencies } = createManager({
            fetch: vi.fn().mockResolvedValue(response),
            parseAssetData: vi.fn().mockResolvedValue(data),
            loadImageResource: vi.fn().mockResolvedValue(resource)
        });
        const processAsset = vi.spyOn(manager as unknown as {
            processAsset(texture: unknown, data: unknown): Promise<unknown>;
        }, 'processAsset').mockResolvedValue(null);

        await manager.downloadAsset('https://cdn.example/assets/modern_chair.jsonc?v=1');

        expect(dependencies.loadImageResource).toHaveBeenCalledWith({
            source: 'https://cdn.example/assets/modern_chair.webp',
            allowAnimation: false
        });
        expect(processAsset).toHaveBeenCalledWith(resource.texture, data);
    });

    it('disposes the previous owned image resource when the same key is replaced', async () =>
    {
        const first = createResource({ label: '' });
        const second = createResource({ label: '' });
        const { manager } = createManager({
            loadImageResource: vi.fn()
                .mockResolvedValueOnce(first)
                .mockResolvedValueOnce(second)
        });
        const source = 'https://cdn.example/replaced.webp';

        await manager.downloadAsset(source);
        await manager.downloadAsset(source);

        expect(first.dispose).toHaveBeenCalledOnce();
        expect(second.dispose).not.toHaveBeenCalled();
        expect(manager.getTexture(source)).toBe(second.texture);
    });

    it('decodes a static WebP texture embedded in a Volt bundle', async () =>
    {
        const resource = createResource();
        const imageBytes = new Uint8Array([
            0x52, 0x49, 0x46, 0x46, 4, 0, 0, 0,
            0x57, 0x45, 0x42, 0x50
        ]);
        const { manager, dependencies } = createManager({
            fetch: vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0))
            }),
            loadImageResource: vi.fn().mockResolvedValue(resource),
            loadVoltBundle: vi.fn().mockImplementation(async (_buffer, decodeTexture) => ({
                texture: await decodeTexture(imageBytes.buffer, 'chair.webp'),
                jsonFile: { name: 'chair' }
            }))
        });
        vi.spyOn(manager as unknown as {
            processAsset(texture: unknown, data: unknown): Promise<unknown>;
        }, 'processAsset').mockResolvedValue(null);

        await manager.downloadAsset('https://cdn.example/chair.NITRO?v=3');

        expect(dependencies.loadImageResource).toHaveBeenCalledWith({
            source: 'chair.webp',
            bytes: expect.any(ArrayBuffer),
            allowAnimation: false
        });
        expect(manager.getTexture('https://cdn.example/chair.NITRO?v=3')).toBe(resource.texture);
    });

    it('rejects SVG texture entries inside Volt bundles', async () =>
    {
        const svgBytes = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>');
        const { manager, dependencies } = createManager({
            fetch: vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0))
            }),
            loadVoltBundle: vi.fn().mockImplementation(async (_buffer, decodeTexture) => ({
                texture: await decodeTexture(svgBytes.buffer, 'unsafe.svg'),
                jsonFile: { name: 'unsafe' }
            }))
        });

        await expect(manager.downloadAsset('https://cdn.example/unsafe.nitro')).rejects.toThrow(/SVG.*Volt bundle/i);
        expect(dependencies.loadImageResource).not.toHaveBeenCalled();
    });
});

describe('AssetManager spritesheet sampling', () =>
{
    it('samples bundle atlases with nearest filtering even though the decoder pins linear', async () =>
    {
        const source = { scaleMode: 'linear', voltFixedScaleMode: true };
        const resource = createResource({ label: '', source });
        const loadVoltBundle = vi.fn(async (_buffer: ArrayBuffer, decodeImage: (bytes: ArrayBuffer, name: string) => Promise<unknown>) =>
        {
            const texture = await decodeImage(new ArrayBuffer(4), 'classic1_wall1.png');

            return { texture, jsonFile: { name: 'classic1_wall1', spritesheet: {} } };
        });
        const { manager, dependencies } = createManager({
            fetch: vi.fn().mockResolvedValue({ ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(8) }),
            loadImageResource: vi.fn().mockResolvedValue(resource),
            loadVoltBundle
        });

        await manager.downloadAsset('https://cdn.example/furni/classic1_wall1.nitro');

        expect(dependencies.loadImageResource).toHaveBeenCalledTimes(1);
        expect(source.scaleMode).toBe('nearest');
        expect(source.voltFixedScaleMode).toBe(true);
    });
});
