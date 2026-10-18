import { GetAvatarRenderManager } from '@volt/avatar';
import { GetTicker, GetTickerTime } from '@volt/utils';

export enum AvatarRedrawKind
{
    // Direction, posture, action or effect changed: the avatar looks wrong until redrawn.
    URGENT = 0,
    // The next frame of a walking avatar: legs that stop moving make it glide.
    WALK = 1,
    // Mouth, eyes and other animation frames of an avatar that stands still.
    COSMETIC = 2
}

/**
 * Time the room may spend redrawing avatars each frame. A crowd that wants more than that is
 * redrawn less often instead of slowing the frame down: avatars of one kind take turns by object
 * id, so all of them keep moving. Each kind keeps a minimum share of the frame and may use what
 * the others did not want last frame; walking legs get the largest share.
 */
export class AvatarCompositeBudget
{
    // The frame time redraws may use grows from MIN_TARGET_MS towards MAX_TARGET_MS while the room
    // still keeps about 60 frames a second and avatars are waiting, and falls back when it does not.
    private static MIN_TARGET_MS: number = 8;
    private static MAX_TARGET_MS: number = 14;
    private static SMOOTH_FRAME_MS: number = 18;
    private static MIN_COMPOSITES: number = 48;
    private static MAX_COMPOSITES: number = 4096;
    private static MIN_SHARES: number[] = [0.3, 0.55, 0.15];
    // A flush costs a fixed amount per atlas page plus a little per avatar; only the per-avatar part
    // is charged to each redraw, from flushes big enough to tell the two apart.
    private static MIN_FLUSH_SAMPLE: number = 32;

    private static _frameTime: number = -1;
    private static _frame: number = 0;
    private static _spentMs: number = 0;
    private static _composites: number = 0;
    private static _demand: number[] = [0, 0, 0];
    private static _used: number[] = [0, 0, 0];
    private static _shares: number[] = [AvatarCompositeBudget.MAX_COMPOSITES, AvatarCompositeBudget.MAX_COMPOSITES, AvatarCompositeBudget.MAX_COMPOSITES];
    private static _turns: number[] = [1, 1, 1];
    private static _prepareMs: number = 0.05;
    private static _flushMs: number = 0.01;
    private static _targetMs: number = AvatarCompositeBudget.MIN_TARGET_MS;
    private static _frameMs: number = 16.7;

    private static beginFrame(): void
    {
        const time = GetTickerTime();

        if(time === this._frameTime) return;

        if(this._composites > 0) this._prepareMs += (((this._spentMs / this._composites) - this._prepareMs) * 0.2);

        // The atlas is drawn after the room update, so the last flush belongs to the last frame.
        const manager = GetAvatarRenderManager();
        const flushJobs = manager.lastCompositionFlushJobs;

        if(flushJobs >= this.MIN_FLUSH_SAMPLE) this._flushMs += (((manager.lastCompositionFlushMs / flushJobs) - this._flushMs) * 0.2);

        const demand = this._demand;

        let total = 0;
        let waiting = false;

        for(let kind = 0; kind < demand.length; kind++)
        {
            total += demand[kind];

            if((this._turns[kind] > 1) || (this._used[kind] >= this._shares[kind])) waiting = true;
        }

        this._frameMs += ((GetTicker().elapsedMS - this._frameMs) * 0.1);

        if(this._frameMs > (this.SMOOTH_FRAME_MS + 2)) this._targetMs = Math.max(this.MIN_TARGET_MS, (this._targetMs * 0.97));
        else if(waiting && (this._frameMs < this.SMOOTH_FRAME_MS)) this._targetMs = Math.min(this.MAX_TARGET_MS, (this._targetMs * 1.02));

        const budget = Math.max(this.MIN_COMPOSITES, Math.min(this.MAX_COMPOSITES, Math.floor(this._targetMs / Math.max((this._prepareMs + this._flushMs), 0.001))));

        for(let kind = 0; kind < demand.length; kind++)
        {
            // A kind's minimum share, plus whatever the other kinds did not ask for last frame.
            const unused = Math.max(0, (budget - (total - demand[kind])));
            const share = Math.max(Math.ceil(budget * this.MIN_SHARES[kind]), unused);

            this._shares[kind] = share;
            this._turns[kind] = Math.max(1, Math.ceil(demand[kind] / share));
            demand[kind] = 0;
            this._used[kind] = 0;
        }

        this._spentMs = 0;
        this._composites = 0;
        this._frame++;
        this._frameTime = time;
    }

    public static allow(phase: number, kind: AvatarRedrawKind): boolean
    {
        this.beginFrame();

        this._demand[kind]++;

        const turns = this._turns[kind];

        if((turns > 1) && (((this._frame + phase) % turns) !== 0)) return false;
        if(this._used[kind] >= this._shares[kind]) return false;

        this._used[kind]++;

        return true;
    }

    public static record(ms: number): void
    {
        this.beginFrame();

        this._spentMs += ms;
        this._composites++;
    }
}
