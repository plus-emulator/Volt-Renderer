import { IRoomObjectController, RoomObjectCategory } from '@volt/api';
import { BadgeImageReadyEvent, GetEventDispatcher } from '@volt/events';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoomEngine } from './RoomEngine';
import { RoomManager } from './RoomManager';
import { RoomObjectLogicBase } from './object/logic/RoomObjectLogicBase';

vi.mock('./GetRoomEngine', () => ({ GetRoomEngine: () => null }));
vi.mock('./GetRoomManager', () => ({ GetRoomManager: () => null }));

vi.mock('./GetRoomMessageHandler', () => ({ GetRoomMessageHandler: () => ({ dispose: vi.fn() }) }));

const fixture = () =>
{
    const rooms = new RoomManager();
    const engine = Object.create(RoomEngine.prototype) as RoomEngine;

    Object.assign(engine, {
        _roomManager: rooms,
        _roomObjectEventHandler: { setGameInputHandler: vi.fn() },
        _roomInstanceDatas: new Map(), _roomDatas: new Map(), _areaHideHoleCounts: new Map(),
        _roomsWithInitializedObjects: new Set(), _initializedRooms: new Set(),
        _badgeListenerObjects: new Map(), _badgeImageReadyCallback: null,
        _imageCallbacks: new Map(), _thumbnailCallbacks: new Map(),
        _sessionDataManager: { loadGroupBadgeImage: () => null, loadBadgeImage: () => null },
        clearRoomObjectImageCache: vi.fn(), putBadgeInObjectAssets: vi.fn()
    });

    const add = (roomId: number) =>
    {
        const room = rooms.createRoomInstance(`${roomId}`);
        const object = room.createRoomObject(1, 1, 'badge_furni', RoomObjectCategory.FLOOR) as IRoomObjectController;

        object.setLogic(new RoomObjectLogicBase());
        engine.loadRoomObjectBadgeImage(roomId, 1, RoomObjectCategory.FLOOR, 'pending-badge');

        return object;
    };

    return { engine, rooms, add };
};

const readyListeners = () => (GetEventDispatcher() as any)._listeners.get(BadgeImageReadyEvent.IMAGE_READY)?.length ?? 0;

afterEach(() => GetEventDispatcher().removeAllListeners());

describe('pending room badge image lifetime', () =>
{
    it('drops a departed room and unsubscribes without waiting for a failed download', () =>
    {
        const { engine, rooms, add } = fixture();

        add(14);
        expect(readyListeners()).toBe(1);
        engine.removeRoomInstance(14);
        expect((engine as any)._badgeListenerObjects.size).toBe(0);
        expect(readyListeners()).toBe(0);
        GetEventDispatcher().dispatchEvent(new BadgeImageReadyEvent('pending-badge', null));
        expect((engine as any).putBadgeInObjectAssets).not.toHaveBeenCalled();
        engine.dispose();
        rooms.dispose();
    });

    it('preserves a live preview awaiting the same badge and only updates its object', () =>
    {
        const { engine, rooms, add } = fixture();

        add(14);
        const preview = add(2147418113);
        engine.removeRoomInstance(14);
        expect((engine as any)._badgeListenerObjects.get('pending-badge')).toHaveLength(1);
        expect(readyListeners()).toBe(1);
        GetEventDispatcher().dispatchEvent(new BadgeImageReadyEvent('pending-badge', null));
        expect((engine as any).putBadgeInObjectAssets).toHaveBeenCalledExactlyOnceWith(preview, 'pending-badge', true);
        expect(readyListeners()).toBe(0);
        engine.dispose();
        rooms.dispose();
    });

    it('drops an individually removed item and unregisters on engine disposal', () =>
    {
        const { engine, rooms, add } = fixture();

        add(14);
        (engine as any).removeRoomObject(14, 1, RoomObjectCategory.FLOOR);
        expect((engine as any)._badgeListenerObjects.size).toBe(0);
        expect(readyListeners()).toBe(0);
        add(15);
        expect(readyListeners()).toBe(1);
        engine.dispose();
        expect(readyListeners()).toBe(0);
        rooms.dispose();
    });
});
