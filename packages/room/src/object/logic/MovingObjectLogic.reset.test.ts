import { IRoomObjectController, IRoomObjectModel, IVector3D } from '@volt/api';
import { Vector3d } from '@volt/utils';
import { describe, expect, it } from 'vitest';
import { ObjectMoveUpdateMessage, RoomObjectUpdateMessage } from '../../messages';
import { MovingObjectLogic } from './MovingObjectLogic';

const setup = () =>
{
    const store = new Map<string, number>();
    const model = {
        store,
        getValue: (key: string) => store.get(key),
        setValue: (key: string, value: number) => store.set(key, value)
    } as unknown as IRoomObjectModel & { store: Map<string, number> };
    const location = new Vector3d();
    const direction = new Vector3d();
    const object = {
        getLocation: () => location,
        setLocation: (vector: IVector3D) => vector && location.assign(vector),
        getDirection: () => direction,
        setDirection: (vector: IVector3D) => vector && direction.assign(vector),
        setLogic: () => null,
        model
    } as unknown as IRoomObjectController;
    const logic = new MovingObjectLogic();

    logic.setObject(object);
    logic.update(16);

    return { logic, location, model };
};

describe('MovingObjectLogic plain location updates', () =>
{
    it('stops a slide when the furni is put somewhere else', () =>
    {
        const { logic, location } = setup();

        logic.processUpdateMessage(new ObjectMoveUpdateMessage(new Vector3d(0, 0, 0), new Vector3d(4, 0, 0), null, true, 500));
        logic.update(266);
        expect(location.x).toBeGreaterThan(0);

        logic.processUpdateMessage(new RoomObjectUpdateMessage(new Vector3d(7, 3, 0), null));

        for(let time = 282; time <= 1000; time += 16)
        {
            logic.update(time);
            expect(location.x).toBe(7);
            expect(location.y).toBe(3);
        }
    });

    it('lets a slide finish when the update is for where it ends', () =>
    {
        const { logic, location } = setup();

        logic.processUpdateMessage(new ObjectMoveUpdateMessage(new Vector3d(0, 0, 0), new Vector3d(4, 0, 0), null, true, 500));
        logic.update(266);

        const midway = location.x;

        logic.processUpdateMessage(new RoomObjectUpdateMessage(new Vector3d(4, 0, 0), null));
        logic.update(282);

        expect(location.x).toBeGreaterThan(midway);
        expect(location.x).toBeLessThan(4);

        logic.update(1000);

        expect(location.x).toBe(4);
    });

    it('moves a resting furni straight to the new spot', () =>
    {
        const { logic, location } = setup();

        logic.processUpdateMessage(new RoomObjectUpdateMessage(new Vector3d(2, 2, 1), null));
        logic.update(32);

        expect([ location.x, location.y, location.z ]).toEqual([ 2, 2, 1 ]);
    });
});
