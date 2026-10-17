import { GetTickerTime } from '@volt/utils';
import { AvatarImageDirectionCache } from './AvatarImageDirectionCache';

export class AvatarImageActionCache
{
    // Directions kept per action. A part is a short layer list now, not a Pixi container, so all
    // eight fit: a walking avatar turns often, and a crowd that is redrawn less often (see
    // AvatarCompositeBudget) would otherwise rebuild its parts on almost every redraw.
    private static MAX_DIRECTIONS: number = 8;

    private _cache: Map<number, AvatarImageDirectionCache>;
    private _lastAccessTime: number;

    constructor()
    {
        this._cache = new Map();

        this.setLastAccessTime(GetTickerTime());
    }

    public dispose(): void
    {
        this.debugInfo('[dispose]');

        if(!this._cache) return;

        for(const direction of this._cache.values())
        {
            if(direction) direction.dispose();
        }

        this._cache.clear();
    }

    public getDirectionCache(direction: number): AvatarImageDirectionCache
    {
        const existing = this._cache.get(direction);

        if(!existing) return null;

        // All eight directions fit, so nothing is evicted and lookups need no reordering.
        return existing;
    }

    public updateDirectionCache(direction: number, directionCache: AvatarImageDirectionCache): void
    {
        const existing = this._cache.get(direction);

        if(existing && (existing !== directionCache)) existing.dispose();

        this._cache.delete(direction);
        this._cache.set(direction, directionCache);

        // Safe mid-frame: one body part uses one direction per frame, and this is that part's cache.
        while(this._cache.size > AvatarImageActionCache.MAX_DIRECTIONS)
        {
            const oldestKey = this._cache.keys().next().value;
            const oldest = this._cache.get(oldestKey);

            this._cache.delete(oldestKey);

            if(oldest) oldest.dispose();
        }
    }

    public setLastAccessTime(time: number): void
    {
        this._lastAccessTime = time;
    }

    public getLastAccessTime(): number
    {
        return this._lastAccessTime;
    }

    private debugInfo(message: string): void
    {
    }
}
