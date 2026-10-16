import { IRoomObject, RoomObjectVariable } from '@volt/api';
import { Vector3d } from '@volt/utils';
import { describe, expect, it } from 'vitest';
import { SizeData } from '../object/visualization/data/SizeData';
import { RoomGeometry } from '../utils/RoomGeometry';
import { getObjectAltitudeDepth } from './ObjectAltitudeDepth';

// Horse visualization data (size 64), verbatim from the horse pet asset:
// layer 0 body, 1 head, 2 tail, 3 hair (mane), 4 saddle.
const HORSE_LAYERS = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {} };
const HORSE_DIRECTIONS = {
    0: { layers: { 0: { z: 6 }, 1: { z: 4 }, 2: { z: 35 }, 3: { z: 5 }, 4: { z: 6 } } },
    2: { layers: { 0: { z: 5 }, 1: { z: 30 }, 2: { z: 3 }, 3: { z: 35 }, 4: { z: 6 } } },
    4: { layers: { 0: { z: 5 }, 1: { z: 30 }, 2: { z: 3 }, 3: { z: 35 }, 4: { z: 6 } } },
    6: { layers: { 0: { z: 6 }, 1: { z: 4 }, 2: { z: 35 }, 3: { z: 5 }, 4: { z: 6 } } }
};

const BODY = 0;
const HEAD = 1;
const TAIL = 2;
const HAIR = 3;

// Mirrors of the production constants: FurnitureVisualization.DEPTH_MULTIPLIER
// and AvatarVisualization.AVATAR_SPRITE_DEFAULT_DEPTH.
const DEPTH_MULTIPLIER = Math.sqrt(0.5);
const AVATAR_SPRITE_DEFAULT_DEPTH = -0.01;
const RIDING_EFFECT = 77;

const createHorseSizeData = () =>
{
    const sizeData = new SizeData(5, 45);

    expect(sizeData.processLayers(HORSE_LAYERS)).toBe(true);
    expect(sizeData.processDirections(HORSE_DIRECTIONS)).toBe(true);

    return sizeData;
};

const createGeometry = () => new RoomGeometry(64, new Vector3d(-135, 30, 0), new Vector3d(11, 11, 5), new Vector3d(-135, 0.5, 0));

const createHorse = (location: Vector3d): IRoomObject => ({
    getLocation: () => location,
    model: { getValue: () => null }
} as unknown as IRoomObject);

// The server raises the rider one unit above the horse and gives it the riding effect.
const createRider = (location: Vector3d, effect: number): IRoomObject => ({
    getLocation: () => location,
    model: {
        getValue: (key: string) =>
        {
            if(key === RoomObjectVariable.FIGURE_POSTURE) return 'std';
            if(key === RoomObjectVariable.FIGURE_EFFECT) return effect;

            return null;
        }
    }
} as unknown as IRoomObject);

// Sort depth as RoomSpriteCanvas.renderObject computes it. Smaller = drawn later = on top.
const sortDepth = (geometry: RoomGeometry, object: IRoomObject, relativeDepth: number) =>
{
    const screen = geometry.getScreenPosition(object.getLocation());

    expect(screen).not.toBeNull();

    return (screen.z - getObjectAltitudeDepth(object)) + relativeDepth;
};

const ridingOrder = (direction: number, floorHeight: number, effect = RIDING_EFFECT) =>
{
    const geometry = createGeometry();
    const sizeData = createHorseSizeData();
    const horse = createHorse(new Vector3d(5, 5, floorHeight));
    const rider = sortDepth(geometry, createRider(new Vector3d(5, 5, (floorHeight + 1)), effect), AVATAR_SPRITE_DEFAULT_DEPTH);

    return {
        rider,
        layer: (layerId: number) => sortDepth(geometry, horse, ((sizeData.getLayerZOffset(direction, layerId) - (layerId * 0.001)) * DEPTH_MULTIPLIER))
    };
};

describe('horse rider depth sorting', () =>
{
    it.each([0, 2.5])('puts the head and mane in front of the rider and the body behind it when the horse faces the room (floor %s)', floorHeight =>
    {
        const order = ridingOrder(2, floorHeight);

        expect(order.layer(HEAD)).toBeLessThan(order.rider);
        expect(order.layer(HAIR)).toBeLessThan(order.rider);
        expect(order.layer(BODY)).toBeGreaterThan(order.rider);
        expect(order.layer(TAIL)).toBeGreaterThan(order.rider);
    });

    it('puts the head behind the rider and the tail in front when the horse faces away', () =>
    {
        const order = ridingOrder(6, 0);

        expect(order.layer(HEAD)).toBeGreaterThan(order.rider);
        expect(order.layer(HAIR)).toBeGreaterThan(order.rider);
        expect(order.layer(BODY)).toBeGreaterThan(order.rider);
        expect(order.layer(TAIL)).toBeLessThan(order.rider);
    });

    it('applies to the second saddle effect too', () =>
    {
        const order = ridingOrder(2, 0, 103);

        expect(order.layer(HEAD)).toBeLessThan(order.rider);
        expect(order.layer(BODY)).toBeGreaterThan(order.rider);
    });
});
