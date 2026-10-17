import { GetAvatarRenderManager } from '@volt/avatar';
import { GetTickerTime } from '@volt/utils';

/**
 * Time the room may spend redrawing avatars each frame. A crowd that wants more than that is
 * redrawn less often instead of slowing the frame down: avatars take turns by object id, so all
 * of them keep moving. Urgent redraws (direction, posture, action, effect) go first; animation
 * frames, blinks and mouth movement share what is left.
 */
export class AvatarCompositeBudget
{
    private static TARGET_MS: number = 6;
    private static MIN_COMPOSITES: number = 16;
    private static MAX_COMPOSITES: number = 4096;
    // A flush costs a fixed amount per atlas page plus a little per avatar; only the per-avatar part
    // is charged to each redraw, from flushes big enough to tell the two apart.
    private static MIN_FLUSH_SAMPLE: number = 32;

    private static _frameTime: number = -1;
    private static _frame: number = 0;
    private static _spentMs: number = 0;
    private static _composites: number = 0;
    private static _urgentDemand: number = 0;
    private static _cosmeticDemand: number = 0;
    private static _lastUrgentDemand: number = 0;
    private static _lastCosmeticDemand: number = 0;
    private static _prepareMs: number = 0.05;
    private static _flushMs: number = 0.01;
    private static _budget: number = AvatarCompositeBudget.MAX_COMPOSITES;

    private static beginFrame(): void
    {
        const time = GetTickerTime();

        if(time === this._frameTime) return;

        if(this._composites > 0) this._prepareMs += (((this._spentMs / this._composites) - this._prepareMs) * 0.2);

        // The atlas is drawn after the room update, so the last flush belongs to the last frame.
        const manager = GetAvatarRenderManager();
        const flushJobs = manager.lastCompositionFlushJobs;

        if(flushJobs >= this.MIN_FLUSH_SAMPLE) this._flushMs += (((manager.lastCompositionFlushMs / flushJobs) - this._flushMs) * 0.2);

        this._budget = Math.max(this.MIN_COMPOSITES, Math.min(this.MAX_COMPOSITES, Math.floor(this.TARGET_MS / Math.max((this._prepareMs + this._flushMs), 0.001))));
        this._lastUrgentDemand = this._urgentDemand;
        this._lastCosmeticDemand = this._cosmeticDemand;
        this._urgentDemand = 0;
        this._cosmeticDemand = 0;
        this._spentMs = 0;
        this._composites = 0;
        this._frame++;
        this._frameTime = time;
    }

    public static allow(phase: number, urgent: boolean): boolean
    {
        this.beginFrame();

        let share = this._budget;
        let demand = 0;

        if(urgent)
        {
            demand = this._lastUrgentDemand;
            this._urgentDemand++;
        }
        else
        {
            // Animation keeps at least a quarter of the frame, so it never stops altogether.
            share = Math.max(Math.ceil(this._budget / 4), (this._budget - this._lastUrgentDemand));
            demand = this._lastCosmeticDemand;
            this._cosmeticDemand++;
        }

        if((demand > share) && (((this._frame + phase) % Math.ceil(demand / share)) !== 0)) return false;

        return (this._composites < this._budget);
    }

    public static record(ms: number): void
    {
        this.beginFrame();

        this._spentMs += ms;
        this._composites++;
    }
}
