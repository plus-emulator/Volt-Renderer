import { IRoomObjectController, RoomObjectCategory, RoomObjectVariable } from '@volt/api';
import { EventDispatcher, RoomObjectWidgetRequestEvent, RoomToObjectOwnAvatarMoveEvent } from '@volt/events';
import { describe, expect, it, vi } from 'vitest';
import { RoomManager } from './RoomManager';
import { FurnitureChangeStateWhenStepOnLogic } from './object/logic/furniture/FurnitureChangeStateWhenStepOnLogic';
import { FurnitureHighScoreLogic } from './object/logic/furniture/FurnitureHighScoreLogic';

vi.mock('./GetRoomEngine', () => ({ GetRoomEngine: () => null }));
vi.mock('./GetRoomManager', () => ({ GetRoomManager: () => null }));

const listenerCount = (dispatcher: EventDispatcher) =>
    (dispatcher as any)._listeners.get(RoomToObjectOwnAvatarMoveEvent.ROAME_MOVE_TO)?.length ?? 0;

const addPressureTile = (manager: RoomManager, roomId: string, dispatcher: EventDispatcher) =>
{
    const room = manager.createRoomInstance(roomId);
    const object = room.createRoomObject(1, 1, 'pressure_tile', RoomObjectCategory.FLOOR) as IRoomObjectController;
    const logic = new FurnitureChangeStateWhenStepOnLogic();

    logic.eventDispatcher = dispatcher;
    object.setLogic(logic);
    logic.initialize({} as any);

    return { room, object, logic };
};

describe('room switching lifecycle', () =>
{
    it('releases movement listeners on every whole-room disposal', () =>
    {
        const manager = new RoomManager();
        const events = new EventDispatcher();

        for(let cycle = 0; cycle < 100; cycle++)
        {
            const { logic } = addPressureTile(manager, `${cycle}`, events);

            expect(listenerCount(events)).toBe(1);
            manager.removeRoomInstance(`${cycle}`);
            expect(logic.object).toBeNull();
            expect(listenerCount(events)).toBe(0);
        }

        manager.dispose();
        events.dispose();
    });

    it('tears down an individually removed item once and stops ticking departed rooms', () =>
    {
        const manager = new RoomManager();
        const events = new EventDispatcher();

        manager.addUpdateCategory(RoomObjectCategory.FLOOR);
        const { room, logic } = addPressureTile(manager, '14', events);
        const update = vi.spyOn(logic, 'update');
        const teardown = vi.spyOn(logic, 'tearDown');

        manager.update(100);
        expect(update).toHaveBeenCalledOnce();
        room.removeRoomObject(1, RoomObjectCategory.FLOOR);
        manager.removeRoomInstance('14');
        manager.update(200);
        expect(update).toHaveBeenCalledOnce();
        expect(teardown).toHaveBeenCalledOnce();
        expect(listenerCount(events)).toBe(0);
        manager.dispose();
        events.dispose();
    });

    it('closes a high-score widget before disposing its room object model', () =>
    {
        const manager = new RoomManager();
        const events = new EventDispatcher();
        const room = manager.createRoomInstance('14');
        const object = room.createRoomObject(1, 1, 'highscore', RoomObjectCategory.FLOOR) as IRoomObjectController;
        const logic = new FurnitureHighScoreLogic();
        const hidden = vi.fn(() => expect(object.model.getValue(RoomObjectVariable.FURNITURE_REAL_ROOM_OBJECT)).toBe(1));

        object.model.setValue(RoomObjectVariable.FURNITURE_REAL_ROOM_OBJECT, 1);
        logic.eventDispatcher = events;
        object.setLogic(logic);
        events.addEventListener(RoomObjectWidgetRequestEvent.HIDE_HIGH_SCORE_DISPLAY, hidden);
        manager.removeRoomInstance('14');
        expect(hidden).toHaveBeenCalledOnce();
        manager.dispose();
        events.dispose();
    });
});
