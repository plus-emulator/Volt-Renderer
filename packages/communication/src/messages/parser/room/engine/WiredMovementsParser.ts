import { IMessageDataWrapper, IMessageParser, ObjectRolling } from '@volt/api';
import { Vector3d } from '@volt/utils';

function parseDirection(value: number): number
{
    return (value % 8) * 45;
}

export class WiredUserMovementData extends ObjectRolling
{
    constructor(id: number, location: Vector3d, targetLocation: Vector3d, movementType: string, private _bodyDirection: number, private _headDirection: number, private _duration: number, private _animationType: number, private _jumpPower?: number)
    {
        super(id, location, targetLocation, movementType);
    }

    public get bodyDirection(): number
    {
        return this._bodyDirection;
    }

    public get headDirection(): number
    {
        return this._headDirection;
    }

    public get duration(): number
    {
        return this._duration;
    }

    public get animationType(): number
    {
        return this._animationType;
    }

    public get jumpPower(): number | undefined
    {
        return this._jumpPower;
    }
}

export class WiredFurniMovementData extends ObjectRolling
{
    constructor(id: number, location: Vector3d, targetLocation: Vector3d, private _rotation: number, private _duration: number, private _overshootTimeMs?: number, private _curveStrength?: number)
    {
        super(id, location, targetLocation, ObjectRolling.SLIDE);
    }

    public get rotation(): number
    {
        return this._rotation;
    }

    public get duration(): number
    {
        return this._duration;
    }

    public get overshootTimeMs(): number | undefined
    {
        return this._overshootTimeMs;
    }

    public get curveStrength(): number | undefined
    {
        return this._curveStrength;
    }
}

export class WiredWallItemMovementData
{
    constructor(private _id: number, private _enabled: boolean, private _values: number[])
    {
    }

    public get id(): number
    {
        return this._id;
    }

    public get enabled(): boolean
    {
        return this._enabled;
    }

    public get values(): number[]
    {
        return this._values;
    }
}

export class WiredUserDirectionUpdateData
{
    constructor(private _id: number, private _headDirection: number, private _bodyDirection: number)
    {
    }

    public get id(): number
    {
        return this._id;
    }

    public get headDirection(): number
    {
        return this._headDirection;
    }

    public get bodyDirection(): number
    {
        return this._bodyDirection;
    }
}

export class WiredMovementsParser implements IMessageParser
{
    private _furniMovements: WiredFurniMovementData[];
    private _userMovements: WiredUserMovementData[];
    private _wallItemMovements: WiredWallItemMovementData[];
    private _userDirectionUpdates: WiredUserDirectionUpdateData[];

    public flush(): boolean
    {
        this._furniMovements = [];
        this._userMovements = [];
        this._wallItemMovements = [];
        this._userDirectionUpdates = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();

        if(!wrapper) return false;

        try
        {
            if(this.parseMovements(wrapper) && !wrapper.bytesAvailable) return true;
        }
        catch
        {
            // A truncated body must never leave a partially applicable batch.
        }

        this.flush();

        return false;
    }

    private parseMovements(wrapper: IMessageDataWrapper): boolean
    {
        let totalMovements = wrapper.readInt();

        if(totalMovements < 0) return false;

        while(totalMovements > 0)
        {
            const type = wrapper.readInt();

            switch(type)
            {
                case 0:
                {
                    const fromX = wrapper.readInt();
                    const fromY = wrapper.readInt();
                    const toX = wrapper.readInt();
                    const toY = wrapper.readInt();
                    const fromZ = Number(wrapper.readString());
                    const toZ = Number(wrapper.readString());
                    const id = wrapper.readInt();
                    const animationType = wrapper.readInt();
                    const duration = wrapper.readInt();
                    const bodyDirection = parseDirection(wrapper.readInt());
                    const headDirection = parseDirection(wrapper.readInt());
                    const jumpPower = wrapper.readBoolean() ? wrapper.readInt() : undefined;

                    if(![ fromZ, toZ, duration, jumpPower ?? 0 ].every(Number.isFinite)) return false;

                    const movementType = (animationType === 0) ? ObjectRolling.MOVE : ObjectRolling.SLIDE;

                    this._userMovements.push(new WiredUserMovementData(
                        id,
                        new Vector3d(fromX, fromY, fromZ),
                        new Vector3d(toX, toY, toZ),
                        movementType,
                        bodyDirection,
                        headDirection,
                        duration,
                        animationType,
                        jumpPower));
                    break;
                }
                case 1:
                {
                    const fromX = wrapper.readInt();
                    const fromY = wrapper.readInt();
                    const toX = wrapper.readInt();
                    const toY = wrapper.readInt();
                    const fromZ = Number(wrapper.readString());
                    const toZ = Number(wrapper.readString());
                    const id = wrapper.readInt();
                    const duration = wrapper.readInt();
                    const rotation = parseDirection(wrapper.readInt());
                    const overshootTimeMs = wrapper.readBoolean() ? wrapper.readInt() : undefined;
                    const curveStrength = wrapper.readBoolean() ? wrapper.readInt() : undefined;

                    if(![ fromZ, toZ, duration, overshootTimeMs ?? 0, curveStrength ?? 0 ].every(Number.isFinite)) return false;

                    this._furniMovements.push(new WiredFurniMovementData(
                        id,
                        new Vector3d(fromX, fromY, fromZ),
                        new Vector3d(toX, toY, toZ),
                        rotation,
                        duration,
                        overshootTimeMs,
                        curveStrength));
                    break;
                }
                case 2:
                {
                    const id = wrapper.readInt();
                    const enabled = wrapper.readBoolean();
                    const values: number[] = [];

                    let index = 0;

                    while(index < 9)
                    {
                        values.push(wrapper.readInt());
                        index++;
                    }

                    this._wallItemMovements.push(new WiredWallItemMovementData(id, enabled, values));
                    break;
                }
                case 3:
                {
                    const id = wrapper.readInt();
                    const bodyDirection = parseDirection(wrapper.readInt());
                    const headDirection = parseDirection(wrapper.readInt());

                    this._userDirectionUpdates.push(new WiredUserDirectionUpdateData(id, headDirection, bodyDirection));
                    break;
                }
                default:
                    return false;
            }

            totalMovements--;
        }

        return true;
    }

    public get itemMovements(): WiredFurniMovementData[]
    {
        return this._furniMovements;
    }

    public get unitMovements(): WiredUserMovementData[]
    {
        return this._userMovements;
    }

    public get furniMovements(): WiredFurniMovementData[]
    {
        return this._furniMovements;
    }

    public get userMovements(): WiredUserMovementData[]
    {
        return this._userMovements;
    }

    public get wallItemMovements(): WiredWallItemMovementData[]
    {
        return this._wallItemMovements;
    }

    public get userDirectionUpdates(): WiredUserDirectionUpdateData[]
    {
        return this._userDirectionUpdates;
    }
}
