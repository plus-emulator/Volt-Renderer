import { CanonicalWiredMovement, IRoomObjectController, IVector3D } from '@volt/api';
import { RoomObjectUpdateMessage } from './RoomObjectUpdateMessage';

export class ObjectMoveUpdateMessage extends RoomObjectUpdateMessage
{
    public static DEFAULT_DURATION: number = 500;

    private _targetLocation: IVector3D;
    private _isSlide: boolean;
    private _duration: number;
    private _elapsed: number;
    private _anchorObject: IRoomObjectController;
    private _anchorOffset: IVector3D;

    constructor(location: IVector3D, targetLocation: IVector3D, direction: IVector3D, isSlide: boolean = false, duration: number = ObjectMoveUpdateMessage.DEFAULT_DURATION, elapsed: number = 0, anchorObject: IRoomObjectController = null, anchorOffset: IVector3D = null, private _canonicalWired: CanonicalWiredMovement = null)
    {
        super(location, direction);

        this._targetLocation = targetLocation;
        this._isSlide = isSlide;
        this._duration = duration;
        this._elapsed = elapsed;
        this._anchorObject = anchorObject;
        this._anchorOffset = anchorOffset;
        this._canonicalWired = _canonicalWired ? Object.freeze({ ..._canonicalWired }) : null;
    }

    public get canonicalWired(): CanonicalWiredMovement
    {
        return this._canonicalWired;
    }

    public static validCanonical(location: IVector3D, target: IVector3D, direction: IVector3D, duration: number, metadata: CanonicalWiredMovement): boolean
    {
        if(!metadata) return true;

        if(!location || !target || !direction) return false;

        if(![ location.x, location.y, location.z, target.x, target.y, target.z,
            direction.x, direction.y, direction.z, duration,
            ...([ metadata.animationType, metadata.jumpPower, metadata.overshootTimeMs, metadata.curveStrength ]
                .filter(value => value !== undefined)) ].every(Number.isFinite)) return false;

        let dx = target.x - location.x;
        let dy = target.y - location.y;
        const dz = target.z - location.z;
        const baseDuration = Math.max(1, duration);
        const adjusted = baseDuration + (metadata.overshootTimeMs ?? 0);

        if(metadata.overshootTimeMs !== undefined && Number.isInteger(adjusted) && adjusted > 0 && adjusted <= 2147483647)
        {
            dx *= adjusted / baseDuration;
            dy *= adjusted / baseDuration;
        }

        // Match the actual Vector3d norm and interpolation arithmetic before
        // any consumer can reset an active move or publish avatar side effects.
        const distance = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
        const curve = metadata.jumpPower ?? metadata.curveStrength ?? 0;
        const curveCoefficient = (curve / 100) * (distance / 4) * 4;

        return [ dx, dy, dz, distance, curveCoefficient,
            location.x + dx, location.y + dy, location.z + dz,
            Math.max(location.z, target.z) + Math.max(0, curveCoefficient / 4),
            Math.min(location.z, target.z) + Math.min(0, curveCoefficient / 4) ].every(Number.isFinite);
    }

    public get targetLocation(): IVector3D
    {
        if(!this._targetLocation) return this.location;

        return this._targetLocation;
    }

    public get isSlide(): boolean
    {
        return this._isSlide;
    }

    public get duration(): number
    {
        return this._duration;
    }

    public get elapsed(): number
    {
        return this._elapsed;
    }

    public get anchorObject(): IRoomObjectController
    {
        return this._anchorObject;
    }

    public get anchorOffset(): IVector3D
    {
        return this._anchorOffset;
    }
}
