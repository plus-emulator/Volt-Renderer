import { describe, expect, it, vi } from 'vitest';
import { AvatarImageActionCache } from './AvatarImageActionCache';
import { AvatarImageDirectionCache } from './AvatarImageDirectionCache';
import type { AvatarImagePartContainer } from '../AvatarImagePartContainer';
import type { AvatarImageBodyPartContainer } from '../AvatarImageBodyPartContainer';

const part = (count: number) => ({ frameCount: count, getCacheableKey: vi.fn((frame: number) => `${frame % count}`) });

describe('avatar direction caching', () =>
{
    it('retains three recently used directions and disposes replaced entries', () =>
    {
        const action = new AvatarImageActionCache();
        const directions = Array.from({ length: 5 }, () => new AvatarImageDirectionCache([]));
        const dispose = directions.map(direction => vi.spyOn(direction, 'dispose'));
        for(let i = 0; i < 3; i++) action.updateDirectionCache(i, directions[i]);
        action.getDirectionCache(0);
        action.updateDirectionCache(3, directions[3]);
        expect(dispose[1]).toHaveBeenCalledOnce();
        expect(action.getDirectionCache(1)).toBeNull();
        expect(action.getDirectionCache(0)).toBe(directions[0]);
        action.updateDirectionCache(0, directions[4]);
        expect(dispose[0]).toHaveBeenCalledOnce();
        action.updateDirectionCache(0, directions[4]);
        expect(dispose[4]).not.toHaveBeenCalled();
        action.dispose();
        expect(dispose.every(call => call.mock.calls.length === 1)).toBe(true);
    });

    it('builds keys only once per combined animation period for 1000 avatars', () =>
    {
        const parts = [part(4), part(6)];
        const caches = Array.from({ length: 1000 }, () => new AvatarImageDirectionCache(parts as unknown as AvatarImagePartContainer[]));
        for(let frame = 0; frame < 120; frame++)
        {
            for(const cache of caches) cache.getImageContainer(frame);
        }
        expect(parts[0].getCacheableKey).toHaveBeenCalledTimes(12 * 1000);
        expect(parts[1].getCacheableKey).toHaveBeenCalledTimes(12 * 1000);
        for(const cache of caches) cache.dispose();
    });

    it('keeps matching frames and avoids unbounded memoization for long periods', () =>
    {
        const parts = [part(17), part(19)];
        const cache = new AvatarImageDirectionCache(parts as unknown as AvatarImagePartContainer[]);
        const image = { dispose: vi.fn() } as unknown as AvatarImageBodyPartContainer;
        cache.updateImageContainer(image, 1);
        expect(cache.getImageContainer(324)).toBe(image);
        expect(cache.getImageContainer(2)).toBeNull();
        expect(parts[0].getCacheableKey).toHaveBeenCalledTimes(3);
        cache.dispose();
        expect(image.dispose).toHaveBeenCalledOnce();
    });
});
