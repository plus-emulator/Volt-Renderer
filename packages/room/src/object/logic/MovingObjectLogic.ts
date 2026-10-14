import { IRoomObjectController, IRoomObjectModel, IRoomObjectUpdateMessage, IVector3D, RoomObjectVariable } from '@volt/api';
import { GetTickerTime, Vector3d } from '@volt/utils';
import { ObjectMoveUpdateMessage } from '../../messages';
import { RoomObjectLogicBase } from './RoomObjectLogicBase';

export class MovingObjectLogic extends RoomObjectLogicBase
{
    /** Habbo's jump strength, from the wired move-style hint (packet 5110). */
    public static readonly STYLE_JUMP = 7;

    public static DEFAULT_UPDATE_INTERVAL: number = 500;
    private static LOCATION_EPSILON: number = 0.01;
    private static TEMP_VECTOR: Vector3d = new Vector3d();

    // Roller pulses arrive once per server tick with the same duration the
    // client interpolates at, so every hop finishes just before the next
    // packet lands and the object visibly stalls for the network jitter.
    // When consecutive slides arrive at a steady cadence we stretch each
    // fresh hop slightly past that cadence so the next pulse still finds an
    // active interpolation and chains through the queue, then drain queued
    // hops at the cadence itself so the backlog stays a constant one buffer.
    private static SLIDE_CHAIN_BUFFER: number = 100;
    private static SLIDE_PERIOD_MIN: number = 100;
    private static SLIDE_PERIOD_MAX: number = 4000;

    private _canonicalWired: ObjectMoveUpdateMessage = null;
    private _canonicalCurve: number = 0;

    private _liftAmount: number;

    private _location: Vector3d;
    private _locationDelta: Vector3d;
    private _followObject: IRoomObjectController;
    private _followOffset: Vector3d;
    private _lastUpdateTime: number;
    private _changeTime: number;
    private _updateInterval: number;
    private _queuedMoveMessages: ObjectMoveUpdateMessage[];
    private _lastSlideArrivalTime: number;
    private _estimatedSlidePeriod: number;
    private _hopping: boolean;
    private _landing: Vector3d;

    constructor()
    {
        super();

        this._liftAmount = 0;

        this._location = new Vector3d();
        this._locationDelta = new Vector3d();
        this._followObject = null;
        this._followOffset = new Vector3d();
        this._lastUpdateTime = 0;
        this._changeTime = 0;
        this._updateInterval = MovingObjectLogic.DEFAULT_UPDATE_INTERVAL;
        this._queuedMoveMessages = [];
        this._lastSlideArrivalTime = 0;
        this._estimatedSlidePeriod = 0;
        this._hopping = false;
        this._landing = null;
    }

    public dispose(): void
    {
        this._liftAmount = 0;
        this._queuedMoveMessages = [];
        this._lastSlideArrivalTime = 0;
        this._estimatedSlidePeriod = 0;

        super.dispose();
    }

    public update(time: number): void
    {
        super.update(time);

        const locationOffset = this.getLocationOffset();
        const model = this.object && this.object.model;
        let completedInterpolation = false;

        if(model)
        {
            if(locationOffset)
            {
                if(this._liftAmount !== locationOffset.z)
                {
                    this._liftAmount = locationOffset.z;

                    model.setValue(RoomObjectVariable.FURNITURE_LIFT_AMOUNT, this._liftAmount);
                }
            }
            else
            {
                if(this._liftAmount !== 0)
                {
                    this._liftAmount = 0;

                    model.setValue(RoomObjectVariable.FURNITURE_LIFT_AMOUNT, this._liftAmount);
                }
            }
        }

        if(this.isAnimating() || locationOffset)
        {
            const vector = MovingObjectLogic.TEMP_VECTOR;

            let difference = (this.time - this._changeTime);

            if(difference === (this._updateInterval >> 1)) difference++;

            if(difference > this._updateInterval) difference = this._updateInterval;

            if(this._followObject)
            {
                vector.assign(this._followObject.getLocation());
                vector.add(this._followOffset);
            }
            else if((this._locationDelta.length > 0) || this._hopping)
            {
                const progress = difference / this._updateInterval;

                vector.assign(this._locationDelta);
                vector.multiply(this._canonicalWired ? progress : this.easeProgress(progress, model));
                vector.add(this._location);
                vector.z += this._canonicalWired
                    ? (this._canonicalCurve / 100) * (this._locationDelta.length / 4) * 4 * progress * (1 - progress)
                    : MovingObjectLogic.jumpLift(progress, model);
            }
            else
            {
                vector.assign(this._location);
            }

            if(locationOffset) vector.add(locationOffset);

            this.object.setLocation(vector);

            if(difference === this._updateInterval)
            {
                if(this._followObject)
                {
                    this._location.assign(this.object.getLocation());
                    this._followObject = null;
                    this._followOffset.assign(new Vector3d());
                }

                this._locationDelta.x = 0;
                this._locationDelta.y = 0;
                this._locationDelta.z = 0;
                this._hopping = false;
                completedInterpolation = true;

                // An animation that flew past its target, or fell short of it, lands where the furni is.
                if(this._landing)
                {
                    this._location.assign(this._landing);
                    this._landing = null;

                    vector.assign(this._location);

                    if(locationOffset) vector.add(locationOffset);

                    this.object.setLocation(vector);
                }

                // A chained hop still to come was sent with the same hint; it keeps it.
                if(!this._canonicalWired && !this._queuedMoveMessages.length) this.clearMoveStyle();
            }
        }

        this._lastUpdateTime = this.time;

        if(completedInterpolation) this.processQueuedMoveMessage();
    }

    public setObject(object: IRoomObjectController): void
    {
        super.setObject(object);

        if(object) this._location.assign(object.getLocation());
    }

    public processUpdateMessage(message: IRoomObjectUpdateMessage): void
    {
        if(!message) return;

        if(message instanceof ObjectMoveUpdateMessage)
        {
            if(message.canonicalWired)
            {
                if(!ObjectMoveUpdateMessage.validCanonical(message.location, message.targetLocation,
                    message.direction, message.duration, message.canonicalWired)) return;

                this.processCanonicalMove(message);

                return;
            }

            if(this._canonicalWired && message.location)
            {
                // An idle user status confirms the logical endpoint before its
                // Wired animation gets there. Keep the visual move running;
                // actual walking targets and relocations still replace it.
                if(this._canonicalWired.canonicalWired.animationType !== undefined
                    && this.isInterpolating()
                    && this.matchesLocation(message.location, this._canonicalWired.targetLocation)
                    && this.matchesLocation(message.location, message.targetLocation))
                {
                    if(this.object && message.direction) this.object.setDirection(message.direction);

                    return;
                }

                this.resetInterpolationState();
                this._updateInterval = MovingObjectLogic.DEFAULT_UPDATE_INTERVAL;
            }

            if(this.shouldApplyInstantMoveMessage(message))
            {
                super.processUpdateMessage(message);

                if(message.location) this._location.assign(message.location);

                this.resetInterpolationState();

                return;
            }

            if(message.isSlide && !message.anchorObject && (message.elapsed === 0)) this.trackSlideArrival();

            const requiresCustomMoveHandling = !!message.anchorObject || (message.elapsed > 0);

            if(requiresCustomMoveHandling)
            {
                if(this.object && message.direction) this.object.setDirection(message.direction);

                return this.processMoveMessage(message);
            }

            // A chained slide must be queued BEFORE the base handler runs:
            // super.processUpdateMessage snaps the object to the message's
            // start location, which teleports it to the end of the hop it is
            // still interpolating through.
            if(this.shouldQueueMoveMessage(message))
            {
                if(this.object && message.direction) this.object.setDirection(message.direction);

                this.queueMoveMessage(message);

                return;
            }
        }

        if(!(message instanceof ObjectMoveUpdateMessage) && message.location && this.isAnimating())
        {
            // An update for where the move ends (a state toggle mid-slide) lets the move finish.
            if(this.matchesLocation(message.location, this.getMovementEndLocation()))
            {
                super.processUpdateMessage(message);

                return;
            }

            // Anywhere else the furni was put there: stop the old move, or it is drawn past its tile.
            this.resetInterpolationState();
            this.clearMoveStyle();
        }

        super.processUpdateMessage(message);

        if(message.location) this._location.assign(message.location);

        if(message instanceof ObjectMoveUpdateMessage) return this.processMoveMessage(message);
    }

    private processCanonicalMove(message: ObjectMoveUpdateMessage): void
    {
        // Consecutive flat avatar slides may overlap (e.g. 200ms pulses with
        // 300ms animations). Continue from the displayed position instead of
        // snapping to the previous logical endpoint on every packet. Keep
        // the supplied duration/target, and leave jumps and furni trajectories
        // authoritative rather than blending their curves or overshoot.
        const continueGlide = this.object && this._canonicalWired && this.isInterpolating()
            && message.isSlide && this._canonicalWired.isSlide
            && message.canonicalWired.animationType !== undefined
            && this._canonicalWired.canonicalWired.animationType !== undefined
            && !this._canonicalCurve && !(message.canonicalWired.jumpPower ?? message.canonicalWired.curveStrength)
            && !message.canonicalWired.overshootTimeMs && !this._canonicalWired.canonicalWired.overshootTimeMs
            && this.matchesLocation(message.location, this._canonicalWired.targetLocation);
        const start = new Vector3d();

        start.assign(continueGlide ? this.object.getLocation() : message.location);
        this.resetInterpolationState();
        this._canonicalWired = message;
        this._canonicalCurve = message.canonicalWired.jumpPower ?? message.canonicalWired.curveStrength ?? 0;

        if(this.object)
        {
            this.object.setLocation(start);
            this.object.setDirection(message.direction);
        }

        this._location.assign(start);
        this._locationDelta.assign(message.targetLocation);
        this._locationDelta.subtract(this._location);
        const duration = Math.max(1, message.duration);
        const overshoot = message.canonicalWired.overshootTimeMs;
        const adjusted = duration + (overshoot ?? 0);
        this._updateInterval = duration;

        // Native signed overshoot can produce a zero/negative interval. Refuse that
        // adjustment while retaining the valid move at its supplied base duration.
        if(overshoot !== undefined && Number.isInteger(adjusted) && adjusted > 0 && adjusted <= 2147483647)
        {
            this._locationDelta.x *= adjusted / duration;
            this._locationDelta.y *= adjusted / duration;
            this._updateInterval = adjusted;
        }

        this._changeTime = this._lastUpdateTime > 0 ? this._lastUpdateTime : GetTickerTime();
    }

    private getMovementEndLocation(): IVector3D
    {
        if(this._queuedMoveMessages.length) return this._queuedMoveMessages[this._queuedMoveMessages.length - 1].targetLocation;

        if(this._landing) return this._landing;

        const end = new Vector3d();

        end.assign(this._location);
        end.add(this._locationDelta);

        return end;
    }

    private clearMoveStyle(): void
    {
        const model = this.object && this.object.model;

        if(!model) return;

        if(model.getValue<number>(RoomObjectVariable.FURNITURE_MOVE_STYLE) > 0)
        {
            model.setValue(RoomObjectVariable.FURNITURE_MOVE_STYLE, 0);
            model.setValue(RoomObjectVariable.FURNITURE_MOVE_STYLE_INTENSITY, 0);
        }

        if(model.getValue<number>(RoomObjectVariable.FURNITURE_MOVE_OVERSHOOT)) model.setValue(RoomObjectVariable.FURNITURE_MOVE_OVERSHOOT, 0);
    }

    private shouldApplyInstantMoveMessage(message: ObjectMoveUpdateMessage): boolean
    {
        if(!message || !message.location || message.isSlide || !!message.anchorObject || (message.elapsed > 0)) return false;

        return this.matchesLocation(message.location, message.targetLocation);
    }

    private trackSlideArrival(): void
    {
        const arrivalTime = this._lastUpdateTime;
        const sincePrevious = (arrivalTime - this._lastSlideArrivalTime);

        if((this._lastSlideArrivalTime > 0) && (sincePrevious >= MovingObjectLogic.SLIDE_PERIOD_MIN) && (sincePrevious <= MovingObjectLogic.SLIDE_PERIOD_MAX))
        {
            this._estimatedSlidePeriod = sincePrevious;
        }
        else
        {
            this._estimatedSlidePeriod = 0;
        }

        this._lastSlideArrivalTime = arrivalTime;
    }

    private getSlideDuration(message: ObjectMoveUpdateMessage, fromQueue: boolean): number
    {
        const baseDuration = ((message.duration > 0) ? message.duration : ObjectMoveUpdateMessage.DEFAULT_DURATION);

        if(!message.isSlide || !!message.anchorObject) return baseDuration;

        // Only smooth cadences at or slightly above the hop duration (fast
        // rollers). Slower cadences keep the classic move-then-rest look, and
        // one-shot slides (wired choreography) keep their exact duration.
        const chained = ((this._estimatedSlidePeriod > 0) && (this._estimatedSlidePeriod <= (baseDuration + (2 * MovingObjectLogic.SLIDE_CHAIN_BUFFER))));

        if(!chained) return baseDuration;

        return fromQueue ? this._estimatedSlidePeriod : (this._estimatedSlidePeriod + MovingObjectLogic.SLIDE_CHAIN_BUFFER);
    }

    private processMoveMessage(message: ObjectMoveUpdateMessage, fromQueue: boolean = false): void
    {
        if(!message || !this.object || !message.location) return;

        if(this.shouldQueueMoveMessage(message))
        {
            this.queueMoveMessage(message);

            return;
        }

        const hadActiveInterpolation = this.isInterpolating();
        const duration = this.getSlideDuration(message, fromQueue);
        const startLocation = hadActiveInterpolation
            ? this.object.getLocation()
            : message.location;
        const elapsed = Math.max(0, Math.min(duration, message.elapsed));

        this._location.assign(startLocation);
        this.object.setLocation(this._location);
        this._followObject = message.anchorObject;

        if(message.anchorOffset) this._followOffset.assign(message.anchorOffset);
        else this._followOffset.assign(new Vector3d());

        this._changeTime = (this._lastUpdateTime - elapsed);
        this.updateInterval = duration;

        this._locationDelta.assign(message.targetLocation);
        this._locationDelta.subtract(this._location);
        this.applyTrajectory(message.targetLocation);

        if(this._followObject)
        {
            const vector = MovingObjectLogic.TEMP_VECTOR;

            vector.assign(this._followObject.getLocation());
            vector.add(this._followOffset);

            const locationOffset = this.getLocationOffset();

            if(locationOffset) vector.add(locationOffset);

            this.object.setLocation(vector);
        }
        else if(elapsed > 0)
        {
            const vector = MovingObjectLogic.TEMP_VECTOR;

            vector.assign(this._locationDelta);
            vector.multiply((elapsed / this._updateInterval));
            vector.add(this._location);

            const locationOffset = this.getLocationOffset();

            if(locationOffset) vector.add(locationOffset);

            this.object.setLocation(vector);
        }
        else if(hadActiveInterpolation && message.isSlide)
        {
            this.object.setLocation(this._location);
        }
    }

    /**
     * The projectile hint's overshoot stretches the flight past its target (or cuts it short) at the
     * same speed, landing on the target when it ends; a jump with nowhere to go hops on the spot.
     */
    private applyTrajectory(targetLocation: IVector3D): void
    {
        this._hopping = false;
        this._landing = null;

        const model = this.object && this.object.model;

        if(!model || this._followObject) return;

        const factor = MovingObjectLogic.overshootFactor(this._locationDelta.x, this._locationDelta.y, model.getValue<number>(RoomObjectVariable.FURNITURE_MOVE_OVERSHOOT) ?? 0);

        if(factor !== 1)
        {
            this._landing = new Vector3d(targetLocation.x, targetLocation.y, targetLocation.z);
            this._locationDelta.x *= factor;
            this._locationDelta.y *= factor;
            this.updateInterval = Math.round(this._updateInterval * factor);
        }

        if((this._locationDelta.length === 0) && (model.getValue<number>(RoomObjectVariable.FURNITURE_MOVE_STYLE) === MovingObjectLogic.STYLE_JUMP)) this._hopping = true;
    }

    /** How much longer a flight gets for an overshoot of this many tiles: 1 leaves it alone. */
    public static overshootFactor(dx: number, dy: number, overshootTiles: number): number
    {
        if(!overshootTiles || !Number.isFinite(overshootTiles)) return 1;

        const distance = Math.max(Math.abs(dx), Math.abs(dy));

        if(distance <= 0) return 1;

        return Math.max(0, (distance + overshootTiles) / distance);
    }

    private isAnimating(): boolean
    {
        return (this._locationDelta.length > 0) || this._hopping || !!this._landing;
    }

    private resetInterpolationState(): void
    {
        this._canonicalWired = null;
        this._canonicalCurve = 0;
        this._hopping = false;
        this._landing = null;
        this._locationDelta.x = 0;
        this._locationDelta.y = 0;
        this._locationDelta.z = 0;
        this._followObject = null;
        this._followOffset.assign(new Vector3d());
        this._queuedMoveMessages = [];
        this._changeTime = this._lastUpdateTime;
        this._lastSlideArrivalTime = 0;
        this._estimatedSlidePeriod = 0;
    }

    private isInterpolating(): boolean
    {
        return (this._locationDelta.length > 0) && ((this.time - this._changeTime) < this._updateInterval);
    }

    private shouldQueueMoveMessage(message: ObjectMoveUpdateMessage): boolean
    {
        if(!message.isSlide || !!message.anchorObject || !this.isInterpolating() || !message.location || !message.targetLocation) return false;

        const expectedStartLocation = this.getQueuedMovementTailLocation();

        if(!expectedStartLocation) return false;

        return this.matchesLocation(message.location, expectedStartLocation)
            && !this.matchesLocation(message.targetLocation, expectedStartLocation);
    }

    private queueMoveMessage(message: ObjectMoveUpdateMessage): void
    {
        this._queuedMoveMessages.push(new ObjectMoveUpdateMessage(
            message.location,
            message.targetLocation,
            message.direction,
            message.isSlide,
            message.duration,
            message.elapsed,
            message.anchorObject,
            message.anchorOffset));
    }

    private processQueuedMoveMessage(): void
    {
        if(!this._queuedMoveMessages.length) return;

        const nextMoveMessage = this._queuedMoveMessages.shift();

        if(!nextMoveMessage) return;

        this.processMoveMessage(nextMoveMessage, true);
    }

    private getQueuedMovementTailLocation(): IVector3D
    {
        if(this._queuedMoveMessages.length)
        {
            const queuedMoveMessage = this._queuedMoveMessages[this._queuedMoveMessages.length - 1];

            if(queuedMoveMessage?.targetLocation) return queuedMoveMessage.targetLocation;
        }

        if(this._locationDelta.length <= 0) return null;

        const targetLocation = new Vector3d();

        targetLocation.assign(this._location);
        targetLocation.add(this._locationDelta);

        return targetLocation;
    }

    private matchesLocation(first: IVector3D, second: IVector3D): boolean
    {
        if(!first || !second) return false;

        return (Math.abs(first.x - second.x) <= MovingObjectLogic.LOCATION_EPSILON)
            && (Math.abs(first.y - second.y) <= MovingObjectLogic.LOCATION_EPSILON)
            && (Math.abs(first.z - second.z) <= MovingObjectLogic.LOCATION_EPSILON);
    }

    private easeProgress(progress: number, model: IRoomObjectModel): number
    {
        if(!model) return progress;

        const style = model.getValue<number>(RoomObjectVariable.FURNITURE_MOVE_STYLE);

        if(!style || (style <= 0)) return progress;

        const intensity = Math.max(0, Math.min(100, (model.getValue<number>(RoomObjectVariable.FURNITURE_MOVE_STYLE_INTENSITY) ?? 100))) / 100;
        const t = Math.max(0, Math.min(1, progress));
        const styled = MovingObjectLogic.applyMoveStyle(t, style);

        return t + ((styled - t) * intensity);
    }

    /**
     * Habbo's jump strength (style 7): the object hops to its tile in a parabola that peaks halfway,
     * a strength of 100 lifting it one tile height; a negative strength dips it instead.
     */
    public static jumpLift(progress: number, model: IRoomObjectModel): number
    {
        if(!model || (model.getValue<number>(RoomObjectVariable.FURNITURE_MOVE_STYLE) !== MovingObjectLogic.STYLE_JUMP)) return 0;

        const strength = (model.getValue<number>(RoomObjectVariable.FURNITURE_MOVE_STYLE_INTENSITY) ?? 0);
        const t = Math.max(0, Math.min(1, progress));

        return (strength / 100) * 4 * t * (1 - t);
    }

    private static applyMoveStyle(t: number, style: number): number
    {
        switch(style)
        {
            case 1: // ease in
                return t * t;
            case 2: // ease out
                return 1 - ((1 - t) * (1 - t));
            case 3: // ease in/out
                return (t < 0.5) ? (2 * t * t) : (1 - (Math.pow((-2 * t) + 2, 2) / 2));
            case 4: // bounce (ease-out bounce)
                return MovingObjectLogic.easeOutBounce(t);
            case 5: { // elastic (ease-out elastic)
                if((t === 0) || (t === 1)) return t;
                const c4 = (2 * Math.PI) / 3;
                return (Math.pow(2, -10 * t) * Math.sin(((t * 10) - 0.75) * c4)) + 1;
            }
            case 6: // drop: accelerate down, land with a small bounce
                return (t < 0.7) ? ((t / 0.7) * (t / 0.7) * 0.98) : (0.98 + (0.02 * MovingObjectLogic.easeOutBounce((t - 0.7) / 0.3)));
            default:
                return t;
        }
    }

    private static easeOutBounce(t: number): number
    {
        const n1 = 7.5625;
        const d1 = 2.75;

        if(t < (1 / d1)) return n1 * t * t;
        if(t < (2 / d1)) return (n1 * (t -= (1.5 / d1)) * t) + 0.75;
        if(t < (2.5 / d1)) return (n1 * (t -= (2.25 / d1)) * t) + 0.9375;
        return (n1 * (t -= (2.625 / d1)) * t) + 0.984375;
    }

    protected getLocationOffset(): IVector3D
    {
        return null;
    }

    protected get lastUpdateTime(): number
    {
        return this._lastUpdateTime;
    }

    protected set updateInterval(interval: number)
    {
        if(interval <= 0) interval = 1;

        this._updateInterval = interval;
    }
}
