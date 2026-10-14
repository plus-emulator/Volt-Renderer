import { GetTickerTime } from '@volt/utils';
import { AvatarImageDirectionCache } from './AvatarImageDirectionCache';

export class AvatarImageActionCache
{
    // Directions kept per action. Each one holds a baked Pixi container per animation frame, and a
    // walking avatar visits all eight; with the finished frames cached in AvatarImage, a rebuild only
    // costs the first frames after turning back to an evicted direction. Three covers a head turned
    // either side of the body.
    private static MAX_DIRECTIONS: number = 3;

    private _cache: Map<string, AvatarImageDirectionCache>;
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
        const key = direction.toString();
        const existing = this._cache.get(key);

        if(!existing) return null;

        // Most recently used last, so the oldest direction is the first one evicted.
        this._cache.delete(key);
        this._cache.set(key, existing);

        return existing;
    }

    public updateDirectionCache(direction: number, directionCache: AvatarImageDirectionCache): void
    {
        const key = direction.toString();
        const existing = this._cache.get(key);

        if(existing && (existing !== directionCache)) existing.dispose();

        this._cache.delete(key);
        this._cache.set(key, directionCache);

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
