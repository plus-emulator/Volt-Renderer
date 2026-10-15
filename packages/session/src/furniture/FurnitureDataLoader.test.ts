import { describe, expect, it, vi } from 'vitest';
import { FurnitureDataLoader } from './FurnitureDataLoader';

const data = vi.hoisted(() => ({ load: vi.fn(), texts: new Map<string, string>() }));
vi.mock('@volt/utils', () => ({ loadGamedata: data.load }));
vi.mock('@volt/localization', () => ({ GetLocalizationManager: () => ({ setValue: (key: string, value: string) => data.texts.set(key, value) }) }));
vi.mock('./FurnitureDataUrl', () => ({ GetFurnitureDataUrl: () => '/furniture.json' }));

describe('furniture boot localization order', () => {
    it('downloads before base texts finish, then applies furniture overrides last', async () => {
        let textsReady: () => void;
        const localization = new Promise<void>(resolve => { textsReady = resolve; });
        data.load.mockResolvedValue({ roomitemtypes: { furnitype: [{ id: 1, classname: 'chair', name: 'Furniture name', description: 'Furniture description' }] } });
        const floor = new Map();
        const loader = new FurnitureDataLoader(floor, new Map());
        const loading = loader.init(true, localization);
        expect(data.load).toHaveBeenCalledWith('/furniture.json');
        await Promise.resolve();
        expect(floor.size).toBe(0);
        data.texts.set('roomItem.name.1', 'Base text');
        textsReady();
        await loading;
        expect(floor.size).toBe(1);
        expect(data.texts.get('roomItem.name.1')).toBe('Furniture name');
    });
});
