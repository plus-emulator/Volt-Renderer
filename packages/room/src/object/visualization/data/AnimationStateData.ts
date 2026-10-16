import { AnimationFrame } from './AnimationFrame';

export class AnimationStateData
{
    private _animationId: number;
    private _animationAfterTransitionId: number;
    private _animationOver: boolean;
    private _frameCounter: number;
    private _frames: AnimationFrame[];
    private _lastFramePlayed: boolean[];
    private _animationPlayed: boolean[];
    private _layerCount: number;

    constructor()
    {
        this._animationId = -1;
        this._animationAfterTransitionId = 0;
        this._animationOver = false;
        this._frameCounter = 0;
        this._frames = [];
        this._lastFramePlayed = [];
        this._animationPlayed = [];
        this._layerCount = 0;
    }

    public get animationOver(): boolean
    {
        return this._animationOver;
    }

    public set animationOver(flag: boolean)
    {
        this._animationOver = flag;
    }

    public get frameCounter(): number
    {
        return this._frameCounter;
    }

    public set frameCounter(value: number)
    {
        this._frameCounter = value;
    }

    public get animationId(): number
    {
        return this._animationId;
    }

    public set animationId(animationId: number)
    {
        if(animationId === this._animationId) return;

        this._animationId = animationId;

        this.resetAnimationFrames(false);
    }

    public get animationAfterTransitionId(): number
    {
        return this._animationAfterTransitionId;
    }

    public set animationAfterTransitionId(animationId: number)
    {
        this._animationAfterTransitionId = animationId;
    }

    public dispose(): void
    {
        this.recycleFrames();

        this._frames = null;
        this._lastFramePlayed = null;
        this._animationPlayed = null;
    }

    public setLayerCount(layerCount: number): void
    {
        this._layerCount = layerCount;

        this.resetAnimationFrames();
    }

    public resetAnimationFrames(reset: boolean = true): void
    {
        if(reset || (!this._frames))
        {
            this.recycleFrames();

            this._frames = [];
        }

        this._lastFramePlayed = [];
        this._animationPlayed = [];
        this._animationOver = false;
        this._frameCounter = 0;

        let layerId = 0;

        while(layerId < this._layerCount)
        {
            if(reset || (this._frames.length <= layerId))
            {
                this._frames[layerId] = null;
            }
            else
            {
                const frame = this._frames[layerId];

                if(frame)
                {
                    // AIR WIN63-202610131318-860371703,
                    // com/sulake/habbo/room/object/visualization/data/AnimationStateData.as:110-111
                    // recycles the frame and immediately calls
                    // AnimationFrame.allocate(id, x, y, repeats, 0, isLastFrame) without a
                    // sequence. AnimationFrame.as:58-62 only writes activeSequence /
                    // activeSequenceOffset when one is passed (param7 >= 0), and the
                    // LIFO pool (AnimationFrame.as:41, 132-141) hands the same object back.
                    // The active sequence and offset therefore carry over into the new
                    // animation id, so AnimatedFurnitureVisualization.updateFramesForAnimation
                    // (AnimatedFurnitureVisualization.as:343-354) continues with
                    // getFrameFromSequence(offset + repeats) instead of restarting at frame 0.
                    // This keeps a transition (e.g. wf_antenna2 100 <-> 101) running across
                    // fast 0/1 state flips. Pass them explicitly so the result does not
                    // depend on the pool.
                    const activeSequence = frame.activeSequence;
                    const activeSequenceOffset = frame.activeSequenceOffset;

                    frame.recycle();

                    this._frames[layerId] = AnimationFrame.allocate(frame.id, frame.x, frame.y, frame.repeats, 0, frame.isLastFrame, activeSequence, activeSequenceOffset);
                }
            }

            this._lastFramePlayed[layerId] = false;
            this._animationPlayed[layerId] = false;

            layerId++;
        }
    }

    private recycleFrames(): void
    {
        if(!this._frames || !this._frames.length) return;

        for(const frame of this._frames)
        {
            if(!frame) continue;

            frame.recycle();
        }
    }

    public getFrame(layerId: number): AnimationFrame
    {
        if((layerId < 0) || (layerId >= this._layerCount)) return null;

        return this._frames[layerId];
    }

    public setFrame(layerId: number, frame: AnimationFrame): void
    {
        if((layerId < 0) || (layerId >= this._layerCount)) return;

        const existingFrame = this._frames[layerId];

        if(existingFrame) existingFrame.recycle();

        this._frames[layerId] = frame;
    }

    public getAnimationPlayed(layerId: number): boolean
    {
        if((layerId < 0) || (layerId >= this._layerCount)) return true;

        return this._animationPlayed[layerId];
    }

    public setAnimationPlayed(layerId: number, flag: boolean): void
    {
        if((layerId < 0) || (layerId >= this._layerCount)) return;

        this._animationPlayed[layerId] = flag;
    }

    public getLastFramePlayed(layerId: number): boolean
    {
        if((layerId < 0) || (layerId >= this._layerCount)) return true;

        return this._lastFramePlayed[layerId];
    }

    public setLastFramePlayed(layerId: number, flag: boolean): void
    {
        if((layerId < 0) || (layerId >= this._layerCount)) return;

        this._lastFramePlayed[layerId] = flag;
    }
}