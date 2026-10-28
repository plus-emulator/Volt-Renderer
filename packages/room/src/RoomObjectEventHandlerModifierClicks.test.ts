import { IMessageComposer, IRoomObjectController, ISelectedRoomObjectData, MouseEventType, RoomObjectCategory, RoomObjectOperationType, RoomObjectUserType, RoomObjectVariable } from '@volt/api';
import { ClickFurniMessageComposer, FurnitureFloorUpdateComposer, FurniturePickupComposer, GetCommunication, MoveEntityInFlatMessageComposer, OutgoingHeader, PetMoveComposer } from '@volt/communication';
import { GetEventDispatcher, RoomEngineObjectEvent, RoomObjectMouseEvent, RoomObjectStateChangedEvent, RoomSpriteMouseEvent } from '@volt/events';
import { GetRoomSessionManager } from '@volt/session';
import { Vector3d } from '@volt/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AvatarLogic } from './object/logic/AvatarLogic';
import { FurnitureLogic } from './object/logic/furniture/FurnitureLogic';
import { RoomObjectEventHandler } from './RoomObjectEventHandler';

vi.mock('./GetRoomEngine', () => ({
    GetRoomEngine: () => null
}));

const ROOM_ID = 1;
const FLOOR_TYPE = 'chair_basic';
const WALL_TYPE = 'poster';
const CONFIRM_TYPE = RoomObjectEventHandler.PICKUP_CONFIRM_TYPES[0];

const CATEGORIES: Record<string, number> = {
    [FLOOR_TYPE]: RoomObjectCategory.FLOOR,
    [CONFIRM_TYPE]: RoomObjectCategory.FLOOR,
    [WALL_TYPE]: RoomObjectCategory.WALL,
    [RoomObjectUserType.USER]: RoomObjectCategory.UNIT,
    [RoomObjectUserType.RENTABLE_BOT]: RoomObjectCategory.UNIT,
    [RoomObjectUserType.MONSTER_PLANT]: RoomObjectCategory.UNIT,
    room: RoomObjectCategory.ROOM
};

const createObject = (id: number, type: string, values: Record<string, unknown> = {}) =>
{
    const location = new Vector3d(3, 4, 0);
    const direction = new Vector3d(0);

    return {
        id,
        type,
        model: {
            getValue: (key: string) => values[key],
            setValue: vi.fn()
        },
        logic: { processUpdateMessage: vi.fn() },
        getLocation: () => location,
        setLocation: (vector: Vector3d) => vector && location.assign(vector),
        getDirection: () => direction,
        setDirection: (vector: Vector3d) => vector && direction.assign(vector)
    } as unknown as IRoomObjectController;
};

const createRoom = (options: { decorating?: boolean } = {}) =>
{
    const objects = new Map<string, IRoomObjectController>();
    let selectedData: ISelectedRoomObjectData = null;

    const engine = {
        isDecorating: !!options.decorating,
        moveBlocked: false,
        wiredClickUserOption: 0,
        wiredClickFurniOption: 0,
        areaSelectionManager: { handleTileMouseEvent: vi.fn() },
        getRoomObjectCategoryForType: (type: string) => (CATEGORIES[type] ?? RoomObjectCategory.MINIMUM),
        getRoomObject: (roomId: number, objectId: number, category: number) => objects.get(`${ category }:${ objectId }`) ?? null,
        getSelectedRoomObjectData: () => selectedData,
        setSelectedRoomObjectData: (roomId: number, data: ISelectedRoomObjectData) => (selectedData = data),
        getFurnitureStackingHeightMap: () => ({ validateLocation: () => true }),
        getRoomObjectSelectionArrow: (): IRoomObjectController => null,
        getRoomObjectCursor: (): IRoomObjectController => null,
        setObjectMoverIconSprite: vi.fn(),
        setObjectMoverIconSpriteVisible: vi.fn(),
        removeObjectMoverIconSprite: vi.fn(),
        isAreaSelectionMode: () => false,
        isPlayingGame: () => false,
        whereYouClickIsWhereYouGo: () => false
    };

    const handler = new RoomObjectEventHandler(engine as never);

    const add = (id: number, type: string, values: Record<string, unknown> = {}) =>
    {
        const object = createObject(id, type, values);

        objects.set(`${ CATEGORIES[type] }:${ id }`, object);

        return object;
    };

    let eventCount = 0;

    const mouse = (type: string, object: IRoomObjectController, modifiers: { alt?: boolean; ctrl?: boolean; shift?: boolean } = {}) =>
        handler.handleRoomObjectEvent(new RoomObjectMouseEvent(type, object, `canvas_1_${ ++eventCount }`, !!modifiers.alt, !!modifiers.ctrl, !!modifiers.shift), ROOM_ID);

    return { handler, engine, add, mouse, getSelectedData: () => selectedData };
};

const sent: IMessageComposer<unknown[]>[] = [];
const engineEvents: RoomEngineObjectEvent[] = [];
const recordEngineEvent = (event: RoomEngineObjectEvent) => engineEvents.push(event);
const ENGINE_EVENT_TYPES = [ RoomEngineObjectEvent.REQUEST_MOVE, RoomEngineObjectEvent.REQUEST_ROTATE, RoomEngineObjectEvent.REQUEST_PICKUP, RoomEngineObjectEvent.SELECTED ];

const sentOf = <T>(type: new (...args: never[]) => T) => sent.filter(composer => composer instanceof type) as unknown as T[];
const eventsOf = (type: string) => engineEvents.filter(event => event.type === type);

const session = {
    isSpectator: false,
    pickupPet: vi.fn(),
    pickupBot: vi.fn(),
    userDataManager: { getUserDataByIndex: vi.fn((index: number) => ({ webID: (index * 100) })) }
};

beforeEach(() =>
{
    vi.useFakeTimers();

    sent.length = 0;
    engineEvents.length = 0;

    vi.spyOn(GetCommunication().connection, 'send').mockImplementation((composer: IMessageComposer<unknown[]>) =>
    {
        sent.push(composer);

        return true;
    });
    vi.spyOn(GetRoomSessionManager(), 'getSession').mockReturnValue(session as never);

    for(const type of ENGINE_EVENT_TYPES) GetEventDispatcher().addEventListener(type, recordEngineEvent);
});

afterEach(() =>
{
    for(const type of ENGINE_EVENT_TYPES) GetEventDispatcher().removeEventListener(type, recordEngineEvent);

    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.useRealTimers();
});

describe('AIR modifier clicks on furni', () =>
{
    it('asks to rotate floor furni on a shift-only click and still selects it', () =>
    {
        const { add, mouse } = createRoom();
        const chair = add(7, FLOOR_TYPE);

        mouse(RoomObjectMouseEvent.CLICK, chair, { shift: true });

        expect(eventsOf(RoomEngineObjectEvent.REQUEST_ROTATE)).toEqual([ expect.objectContaining({ objectId: 7, category: RoomObjectCategory.FLOOR }) ]);
        expect(eventsOf(RoomEngineObjectEvent.SELECTED)).toHaveLength(1);
    });

    it('never rotates wall furni on shift-click', () =>
    {
        const { add, mouse } = createRoom();

        mouse(RoomObjectMouseEvent.CLICK, add(8, WALL_TYPE), { shift: true });

        expect(eventsOf(RoomEngineObjectEvent.REQUEST_ROTATE)).toEqual([]);
        expect(sent).toEqual([]);
    });

    it('picks up floor and wall furni on a ctrl-only click', () =>
    {
        const { add, mouse } = createRoom();

        mouse(RoomObjectMouseEvent.CLICK, add(7, FLOOR_TYPE), { ctrl: true });
        mouse(RoomObjectMouseEvent.CLICK, add(8, WALL_TYPE), { ctrl: true });

        expect(sentOf(FurniturePickupComposer).map(composer => composer.getMessageArray())).toEqual([
            [ RoomObjectCategory.FLOOR, 7 ],
            [ RoomObjectCategory.WALL, 8 ]
        ]);
    });

    it('lets the client confirm a ctrl-click pickup of the Variables Web API add-on', () =>
    {
        const { add, mouse } = createRoom();

        mouse(RoomObjectMouseEvent.CLICK, add(9, CONFIRM_TYPE), { ctrl: true });

        expect(eventsOf(RoomEngineObjectEvent.REQUEST_PICKUP)).toHaveLength(1);
        expect(sentOf(FurniturePickupComposer)).toEqual([]);
    });

    it('does nothing special for mixed modifiers', () =>
    {
        const { add, mouse } = createRoom();
        const chair = add(7, FLOOR_TYPE);

        mouse(RoomObjectMouseEvent.CLICK, chair, { ctrl: true, shift: true });
        mouse(RoomObjectMouseEvent.CLICK, chair, { alt: true, shift: true });

        expect(eventsOf(RoomEngineObjectEvent.REQUEST_ROTATE)).toEqual([]);
        expect(sent).toEqual([]);
    });

    it('only sends ClickFurni for a click without modifiers', () =>
    {
        const { add, mouse } = createRoom();
        const chair = add(7, FLOOR_TYPE);
        const poster = add(8, WALL_TYPE);

        mouse(RoomObjectMouseEvent.CLICK, chair);
        mouse(RoomObjectMouseEvent.CLICK, poster);

        expect(sentOf(ClickFurniMessageComposer).map(composer => composer.getMessageArray()[0])).toEqual([ 7, -8 ]);

        sent.length = 0;

        for(const modifiers of [ { alt: true }, { ctrl: true }, { shift: true } ])
        {
            mouse(RoomObjectMouseEvent.CLICK, chair, modifiers);
            mouse(RoomObjectMouseEvent.CLICK, poster, modifiers);
        }

        expect(sentOf(ClickFurniMessageComposer)).toEqual([]);
    });
});

describe('AIR alt press to move', () =>
{
    it('asks to move floor furni, wall furni, rentable bots and monsterplants on an alt-only press', () =>
    {
        const { add, mouse } = createRoom();

        mouse(RoomObjectMouseEvent.MOUSE_DOWN, add(7, FLOOR_TYPE), { alt: true });
        mouse(RoomObjectMouseEvent.MOUSE_DOWN, add(8, WALL_TYPE), { alt: true });
        mouse(RoomObjectMouseEvent.MOUSE_DOWN, add(3, RoomObjectUserType.RENTABLE_BOT), { alt: true });
        mouse(RoomObjectMouseEvent.MOUSE_DOWN, add(4, RoomObjectUserType.MONSTER_PLANT), { alt: true });

        expect(eventsOf(RoomEngineObjectEvent.REQUEST_MOVE).map(event => [ event.objectId, event.category ])).toEqual([
            [ 7, RoomObjectCategory.FLOOR ],
            [ 8, RoomObjectCategory.WALL ],
            [ 3, RoomObjectCategory.UNIT ],
            [ 4, RoomObjectCategory.UNIT ]
        ]);
    });

    it('ignores plain presses, other modifier mixes and ordinary users', () =>
    {
        const { add, mouse } = createRoom();
        const chair = add(7, FLOOR_TYPE);

        mouse(RoomObjectMouseEvent.MOUSE_DOWN, chair);
        mouse(RoomObjectMouseEvent.MOUSE_DOWN, chair, { alt: true, ctrl: true });
        mouse(RoomObjectMouseEvent.MOUSE_DOWN, chair, { alt: true, shift: true });
        mouse(RoomObjectMouseEvent.MOUSE_DOWN, add(2, RoomObjectUserType.USER), { alt: true });

        expect(eventsOf(RoomEngineObjectEvent.REQUEST_MOVE)).toEqual([]);
    });

    it('moves on a plain press while decorating, but not with ctrl or shift', () =>
    {
        const { add, mouse } = createRoom({ decorating: true });
        const chair = add(7, FLOOR_TYPE);

        mouse(RoomObjectMouseEvent.MOUSE_DOWN, chair);
        mouse(RoomObjectMouseEvent.MOUSE_DOWN, chair, { ctrl: true });
        mouse(RoomObjectMouseEvent.MOUSE_DOWN, chair, { shift: true });

        expect(eventsOf(RoomEngineObjectEvent.REQUEST_MOVE)).toHaveLength(1);
    });

    it('drops a moved rentable bot with MoveEntityInFlat using its room index', () =>
    {
        const { handler, add, mouse } = createRoom();
        const bot = add(3, RoomObjectUserType.RENTABLE_BOT);

        expect(handler.modifyRoomObject(ROOM_ID, 3, RoomObjectCategory.UNIT, RoomObjectOperationType.OBJECT_MOVE)).toBe(true);

        bot.setLocation(new Vector3d(5, 6, 0));
        mouse(RoomObjectMouseEvent.CLICK, createObject(-1, 'room'));

        expect(sentOf(MoveEntityInFlatMessageComposer).map(composer => composer.getMessageArray())).toEqual([ [ 3, 5, 6, 0 ] ]);
    });

    it('drops a moved monsterplant with MovePet using its pet id', () =>
    {
        const { handler, add, mouse } = createRoom();
        const plant = add(4, RoomObjectUserType.MONSTER_PLANT);

        handler.modifyRoomObject(ROOM_ID, 4, RoomObjectCategory.UNIT, RoomObjectOperationType.OBJECT_MOVE);

        plant.setLocation(new Vector3d(5, 6, 0));
        mouse(RoomObjectMouseEvent.CLICK, createObject(-1, 'room'));

        expect(sentOf(PetMoveComposer).map(composer => composer.getMessageArray())).toEqual([ [ 400, 5, 6, 0 ] ]);
    });
});

describe('AIR modifier clicks on rentable bots and monsterplants', () =>
{
    it('turns a rentable bot through all eight directions with MoveEntityInFlat and skips selecting it', () =>
    {
        const { add, mouse } = createRoom();
        const bot = add(3, RoomObjectUserType.RENTABLE_BOT);

        mouse(RoomObjectMouseEvent.CLICK, bot, { shift: true });

        expect(sentOf(MoveEntityInFlatMessageComposer).map(composer => composer.getMessageArray())).toEqual([ [ 3, 3, 4, 1 ] ]);
        expect(eventsOf(RoomEngineObjectEvent.SELECTED)).toEqual([]);
    });

    it('turns a monsterplant with MovePet', () =>
    {
        const { add, mouse } = createRoom();

        mouse(RoomObjectMouseEvent.CLICK, add(4, RoomObjectUserType.MONSTER_PLANT, { [RoomObjectVariable.PET_ALLOWED_DIRECTIONS]: [ 0, 90, 180, 270 ] }), { shift: true });

        expect(sentOf(PetMoveComposer).map(composer => composer.getMessageArray())).toEqual([ [ 400, 3, 4, 2 ] ]);
        expect(sentOf(FurnitureFloorUpdateComposer)).toEqual([]);
        expect(eventsOf(RoomEngineObjectEvent.SELECTED)).toEqual([]);
    });

    it('selects the unit when the turn could not be sent', () =>
    {
        const { add, mouse } = createRoom();

        session.userDataManager.getUserDataByIndex.mockReturnValueOnce(null);

        mouse(RoomObjectMouseEvent.CLICK, add(4, RoomObjectUserType.MONSTER_PLANT, { [RoomObjectVariable.PET_ALLOWED_DIRECTIONS]: [ 0, 90 ] }), { shift: true });

        expect(sent).toEqual([]);
        expect(eventsOf(RoomEngineObjectEvent.SELECTED)).toHaveLength(1);
    });

    it('removes a rentable bot or picks up a monsterplant on a ctrl-only click', () =>
    {
        const { add, mouse } = createRoom();

        mouse(RoomObjectMouseEvent.CLICK, add(3, RoomObjectUserType.RENTABLE_BOT), { ctrl: true });
        mouse(RoomObjectMouseEvent.CLICK, add(4, RoomObjectUserType.MONSTER_PLANT), { ctrl: true });

        expect(session.pickupBot).toHaveBeenCalledWith(300);
        expect(session.pickupPet).toHaveBeenCalledWith(400);
    });

    it('leaves ordinary users alone on modifier clicks', () =>
    {
        const { add, mouse } = createRoom();
        const user = add(2, RoomObjectUserType.USER);

        mouse(RoomObjectMouseEvent.CLICK, user, { shift: true });
        mouse(RoomObjectMouseEvent.CLICK, user, { ctrl: true });

        expect(sent).toEqual([]);
        expect(session.pickupBot).not.toHaveBeenCalled();
        expect(session.pickupPet).not.toHaveBeenCalled();
    });
});

describe('modifyRoomObject result', () =>
{
    it('reports whether the request went out', () =>
    {
        const { handler, add } = createRoom();

        add(7, FLOOR_TYPE, { [RoomObjectVariable.FURNITURE_ALLOWED_DIRECTIONS]: [ 0, 90 ] });

        expect(handler.modifyRoomObject(ROOM_ID, 7, RoomObjectCategory.FLOOR, RoomObjectOperationType.OBJECT_ROTATE_POSITIVE)).toBe(true);
        expect(sentOf(FurnitureFloorUpdateComposer).map(composer => composer.getMessageArray())).toEqual([ [ 7, 3, 4, 2 ] ]);
        expect(handler.modifyRoomObject(ROOM_ID, 99, RoomObjectCategory.FLOOR, RoomObjectOperationType.OBJECT_ROTATE_POSITIVE)).toBe(false);
        expect(handler.modifyRoomObject(ROOM_ID, 7, RoomObjectCategory.FLOOR, RoomObjectOperationType.OBJECT_PICKUP)).toBe(true);
    });
});

describe('AIR outgoing headers', () =>
{
    it('uses the WIN63-202610271147-806594867 MovePet 3443 and MoveEntityInFlat 583', () =>
    {
        expect(OutgoingHeader.PET_MOVE).toBe(3443);
        expect(OutgoingHeader.MOVE_ENTITY_IN_FLAT).toBe(583);
    });
});

describe('room object logic mouse events', () =>
{
    const sprite = (type: string, eventId: string, alt: boolean = false) => new RoomSpriteMouseEvent(type, eventId, 'canvas_1', 'tag', 0, 0, 0, 0, false, alt, false, true);

    const attach = <T extends AvatarLogic | FurnitureLogic>(logic: T, object: IRoomObjectController) =>
    {
        const dispatched: { type: string }[] = [];

        logic.setObject(Object.assign(object, { setLogic: (): void => null }));
        logic.eventDispatcher = { dispatchEvent: (event: { type: string }) => dispatched.push(event) } as never;

        return dispatched;
    };

    it('reports a press on a rentable bot, but not on an ordinary user', () =>
    {
        const botLogic = new AvatarLogic();
        const botEvents = attach(botLogic, createObject(3, RoomObjectUserType.RENTABLE_BOT));
        const userLogic = new AvatarLogic();
        const userEvents = attach(userLogic, createObject(2, RoomObjectUserType.USER));

        botLogic.mouseEvent(sprite(MouseEventType.MOUSE_DOWN, 'canvas_1_1', true), null);
        userLogic.mouseEvent(sprite(MouseEventType.MOUSE_DOWN, 'canvas_1_1', true), null);

        expect(botEvents.map(event => event.type)).toEqual([ RoomObjectMouseEvent.MOUSE_DOWN ]);
        expect((botEvents[0] as RoomObjectMouseEvent).altKey).toBe(true);
        expect(userEvents).toEqual([]);
    });

    it('lets furni handle the click of a double-click before the double-click itself', () =>
    {
        const logic = new FurnitureLogic();
        const dispatched = attach(logic, createObject(7, FLOOR_TYPE));

        logic.mouseEvent(sprite(MouseEventType.MOUSE_CLICK, 'canvas_1_1'), null);
        logic.mouseEvent(sprite(MouseEventType.MOUSE_CLICK, 'canvas_1_2'), null);
        logic.mouseEvent(sprite(MouseEventType.DOUBLE_CLICK, 'canvas_1_2'), null);

        expect(dispatched.map(event => event.type)).toEqual([
            RoomObjectMouseEvent.CLICK,
            RoomObjectMouseEvent.CLICK,
            RoomObjectStateChangedEvent.STATE_CHANGE
        ]);
    });
});
