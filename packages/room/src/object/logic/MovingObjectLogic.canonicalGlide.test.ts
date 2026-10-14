import { IRoomObjectController, IVector3D } from '@volt/api';
import { Vector3d } from '@volt/utils';
import { describe, expect, it } from 'vitest';
import { ObjectMoveUpdateMessage } from '../../messages';
import { MovingObjectLogic } from './MovingObjectLogic';

const setup = () =>
{
    const location = new Vector3d();
    const direction = new Vector3d();
    const logic = new MovingObjectLogic();

    logic.setObject({
        getLocation: () => location,
        setLocation: (value: IVector3D) => value && location.assign(value),
        getDirection: () => direction,
        setDirection: (value: IVector3D) => value && direction.assign(value),
        setLogic: () => null,
        model: null
    } as unknown as IRoomObjectController);
    logic.update(1000);

    return { logic, location, direction };
};

const glide = (from: number, to: number, jumpPower = 0) =>
    new ObjectMoveUpdateMessage(new Vector3d(from, 5, 0.5), new Vector3d(to, 5, 0.5),
        new Vector3d(90), true, 300, 0, null, null, { animationType: 0, jumpPower });
const position = (x: number, target: number = x) =>
    new ObjectMoveUpdateMessage(new Vector3d(x, 5, 0.5), new Vector3d(target, 5, 0.5), new Vector3d(180));

describe('canonical Wired avatar glide continuity', () =>
{
    it('joins 200ms conveyor pulses without an arrival snap or a frame pause', () =>
    {
        const { logic, location } = setup();

        logic.processUpdateMessage(glide(5, 6));
        let previousX = location.x;

        for(let elapsed = 10; elapsed <= 2100; elapsed += 10)
        {
            logic.update(1000 + elapsed);
            const beforePacket = location.x;

            if(elapsed % 200 === 0 && elapsed <= 1800)
            {
                const step = elapsed / 200;

                logic.processUpdateMessage(glide(5 + step, 6 + step));
                expect(location.x).toBe(beforePacket);
            }

            expect(location.x - previousX).toBeGreaterThan(0);
            expect(location.x - previousX).toBeLessThan(0.06);
            previousX = location.x;
        }

        expect(location.x).toBeCloseTo(15);
    });

    it('keeps interpolating when an idle status confirms the current destination', () =>
    {
        const { logic, location, direction } = setup();

        logic.processUpdateMessage(glide(5, 6));
        logic.update(1120);
        const beforeStatus = location.x;

        logic.processUpdateMessage(position(6));
        expect(location.x).toBe(beforeStatus);
        expect(direction.x).toBe(180);
        logic.update(1200);
        expect(location.x).toBeGreaterThan(beforeStatus);
        expect(location.x).toBeLessThan(6);
        logic.update(1300);
        expect(location.x).toBe(6);
    });

    it('keeps one-shot duration and endpoint exact', () =>
    {
        const { logic, location } = setup();

        logic.processUpdateMessage(glide(5, 6));
        logic.update(1200);
        expect(location.x).toBeCloseTo(5 + 2 / 3);
        logic.update(1300);
        expect(location.x).toBe(6);
    });

    it('applies a relocation and a new walking destination immediately', () =>
    {
        const { logic, location } = setup();

        logic.processUpdateMessage(glide(5, 6));
        logic.update(1120);
        logic.processUpdateMessage(position(9));
        logic.update(1200);
        expect(location.x).toBe(9);
        logic.processUpdateMessage(glide(9, 10));
        logic.update(1300);
        logic.processUpdateMessage(position(10, 11));
        logic.update(1800);
        expect(location.x).toBe(11);
    });

    it('uses the supplied start for disconnected glides', () =>
    {
        const { logic, location } = setup();

        logic.processUpdateMessage(glide(5, 6));
        logic.update(1200);
        logic.processUpdateMessage(glide(10, 11));
        expect(location.x).toBe(10);
        logic.update(1500);
        expect(location.x).toBe(11);
    });

    it('preserves the supplied curve instead of blending an overlapping jump', () =>
    {
        const { logic, location } = setup();

        logic.processUpdateMessage(glide(5, 6, 100));
        logic.update(1200);
        expect(location.z).toBeGreaterThan(0.5);
        logic.processUpdateMessage(glide(6, 7, 100));
        expect(location.x).toBe(6);
        expect(location.z).toBe(0.5);
        logic.update(1500);
        expect(location.x).toBe(7);
        expect(location.z).toBe(0.5);
    });

    it('leaves furniture overshoot and return packets authoritative', () =>
    {
        const { logic, location } = setup();
        const furniture = (from: number, to: number) => new ObjectMoveUpdateMessage(
            new Vector3d(from, 5, 0.5), new Vector3d(to, 5, 0.5), new Vector3d(90),
            true, 300, 0, null, null, { overshootTimeMs: 100, curveStrength: 0 });

        logic.processUpdateMessage(furniture(5, 6));
        logic.update(1200);
        logic.processUpdateMessage(furniture(6, 7));
        expect(location.x).toBe(6);
        logic.update(1600);
        expect(location.x).toBeCloseTo(7 + 1 / 3);
    });
});
