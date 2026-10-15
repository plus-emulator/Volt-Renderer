import { MouseEventType } from '@volt/api';
import { GetEventDispatcher, RoomZoomEvent } from '@volt/events';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoomEngine } from './RoomEngine';
import { RoomVariableEnum } from './RoomVariableEnum';
import { RoomGeometry } from './utils';

vi.mock('./GetRoomMessageHandler', () => ({
    GetRoomMessageHandler: () => ({})
}));

vi.mock('./GetRoomEngine', () => ({
    GetRoomEngine: () => null
}));

const ROOM_ID = 9;

const createEngine = (canvasScale: number, geometryScale: number = RoomGeometry.SCALE_ZOOMED_IN) =>
{
    const canvas = { scale: canvasScale, handleMouseEvent: vi.fn((_x: number, _y: number, _type: string, ..._modifiers: boolean[]) => true) };
    const engine = Object.create(RoomEngine.prototype) as RoomEngine;
    const roomObjectEventHandler = { getGameInputHandler: (): unknown => null };

    Object.assign(engine, {
        _activeRoomId: ROOM_ID,
        _activeRoomActiveCanvasMouseX: 0,
        _activeRoomActiveCanvasMouseY: 0,
        _activeRoomDragX: 0,
        _activeRoomDragY: 0,
        _activeRoomIsDragged: false,
        _activeRoomWasDragged: false,
        _roomAllowsDragging: true,
        _roomObjectEventHandler: roomObjectEventHandler,
        _areaSelectionManager: { finishSelecting: () => false, areaSelectionState: 0 },
        getRoomInstanceRenderingCanvas: () => canvas,
        getRoomInstanceData: (): unknown => null,
        getRoomInstanceGeometry: () => ({ scale: geometryScale }),
        getRenderingCanvasOverlay: (): unknown => null,
        getOverlayIconSprite: (): unknown => null,
        getSelectedRoomObjectData: (): unknown => null
    });

    Object.defineProperty(engine, 'isDecorating', { get: () => false });

    return { engine, canvas };
};

const zoomEvents: RoomZoomEvent[] = [];
const recordZoom = (event: RoomZoomEvent) => zoomEvents.push(event);

afterEach(() =>
{
    GetEventDispatcher().removeEventListener(RoomZoomEvent.ROOM_ZOOM, recordZoom);
    zoomEvents.length = 0;
});

describe('RoomEngine ctrl+alt click zoom (AIR handleRoomCanvasMouseEvent)', () =>
{
    const click = (engine: RoomEngine, shiftKey: boolean) => engine.dispatchMouseEvent(1, 120, 80, MouseEventType.MOUSE_CLICK, true, true, shiftKey, false);

    it.each([
        // canvas scale, geometry scale, zoom out, next level (0 = 0.5x, 1 = 1x, 2 = 2x, 3 = 4x)
        [ 1, RoomGeometry.SCALE_ZOOMED_IN, false, 2 ],
        [ 2, RoomGeometry.SCALE_ZOOMED_IN, false, 3 ],
        [ 1, RoomGeometry.SCALE_ZOOMED_OUT, false, 1 ],
        [ 2, RoomGeometry.SCALE_ZOOMED_IN, true, 1 ],
        [ 1, RoomGeometry.SCALE_ZOOMED_IN, true, 0 ],
        [ 1, RoomGeometry.SCALE_ZOOMED_OUT, true, 0 ]
    ])('zooms a %sx canvas with geometry %s (out: %s) to level %s around the pointer', (canvasScale, geometryScale, zoomOut, level) =>
    {
        const { engine, canvas } = createEngine(canvasScale, geometryScale);

        GetEventDispatcher().addEventListener(RoomZoomEvent.ROOM_ZOOM, recordZoom);

        click(engine, zoomOut);

        expect(zoomEvents).toHaveLength(1);
        expect(zoomEvents[0].roomId).toBe(ROOM_ID);
        expect(zoomEvents[0].level).toBe(level);
        expect(zoomEvents[0].point).toMatchObject({ x: 120, y: 80 });
        expect(canvas.handleMouseEvent).not.toHaveBeenCalled();
    });

    it('lets ctrl-only and alt-only clicks reach the room', () =>
    {
        const { engine, canvas } = createEngine(1);

        GetEventDispatcher().addEventListener(RoomZoomEvent.ROOM_ZOOM, recordZoom);

        engine.dispatchMouseEvent(1, 10, 10, MouseEventType.MOUSE_CLICK, false, true, false, false);
        engine.dispatchMouseEvent(1, 10, 10, MouseEventType.MOUSE_CLICK, true, false, false, false);

        expect(zoomEvents).toEqual([]);
        expect(canvas.handleMouseEvent).toHaveBeenCalledTimes(2);
    });
});

describe('RoomEngine room dragging', () =>
{
    it('does not swallow a modifier click after a drag whose release never reached the room', () =>
    {
        const { engine, canvas } = createEngine(1);
        const state = engine as unknown as { _activeRoomIsDragged: boolean; _activeRoomWasDragged: boolean };

        // A plain press starts a drag that is released outside the canvas: no mouse up, no click.
        engine.dispatchMouseEvent(1, 100, 100, MouseEventType.MOUSE_MOVE, false, false, false, false);
        engine.dispatchMouseEvent(1, 100, 100, MouseEventType.MOUSE_DOWN, false, false, false, true);
        engine.dispatchMouseEvent(1, 160, 160, MouseEventType.MOUSE_MOVE, false, false, false, true);

        expect(state._activeRoomIsDragged).toBe(true);
        expect(state._activeRoomWasDragged).toBe(true);

        canvas.handleMouseEvent.mockClear();

        engine.dispatchMouseEvent(1, 160, 160, MouseEventType.MOUSE_DOWN, false, false, true, true);
        engine.dispatchMouseEvent(1, 160, 160, MouseEventType.MOUSE_UP, false, false, true, false);
        engine.dispatchMouseEvent(1, 160, 160, MouseEventType.MOUSE_CLICK, false, false, true, false);

        expect(state._activeRoomIsDragged).toBe(false);
        expect(canvas.handleMouseEvent.mock.calls.map(call => call[2])).toEqual([ MouseEventType.MOUSE_DOWN, MouseEventType.MOUSE_UP, MouseEventType.MOUSE_CLICK ]);
    });

    it('still swallows the click that ends a real drag', () =>
    {
        const { engine, canvas } = createEngine(1);

        engine.dispatchMouseEvent(1, 100, 100, MouseEventType.MOUSE_MOVE, false, false, false, false);
        engine.dispatchMouseEvent(1, 100, 100, MouseEventType.MOUSE_DOWN, false, false, false, true);
        engine.dispatchMouseEvent(1, 160, 160, MouseEventType.MOUSE_MOVE, false, false, false, true);
        engine.dispatchMouseEvent(1, 160, 160, MouseEventType.MOUSE_UP, false, false, false, false);

        canvas.handleMouseEvent.mockClear();

        engine.dispatchMouseEvent(1, 160, 160, MouseEventType.MOUSE_CLICK, false, false, false, false);

        expect(canvas.handleMouseEvent).not.toHaveBeenCalled();
    });
});

describe('RoomEngine free furni movements mode', () =>
{
    it('stores the ConfigurationItemStates flag on the room instance', () =>
    {
        const values = new Map<string, number>();
        const instance = { model: { getValue: (key: string) => values.get(key), setValue: (key: string, value: number) => values.set(key, value) } };
        const engine = Object.create(RoomEngine.prototype) as RoomEngine;

        Object.assign(engine, { _activeRoomId: ROOM_ID, getRoomInstance: (roomId: number) => ((roomId === ROOM_ID) ? instance : null) });

        expect(engine.activeRoomHasFreeFurniMovementsMode).toBe(false);

        engine.setFreeFurniMovementsMode(ROOM_ID, true);

        expect(values.get(RoomVariableEnum.FREE_FURNI_MOVEMENTS_MODE)).toBe(1);
        expect(engine.activeRoomHasFreeFurniMovementsMode).toBe(true);

        engine.setFreeFurniMovementsMode(ROOM_ID, false);

        expect(engine.activeRoomHasFreeFurniMovementsMode).toBe(false);
    });
});

describe('RoomEngine chooser disabled', () =>
{
    it('stores the ConfigurationItemStates chooser flag on the room instance', () =>
    {
        const values = new Map<string, number>();
        const instance = { model: { getValue: (key: string) => values.get(key), setValue: (key: string, value: number) => values.set(key, value) } };
        const engine = Object.create(RoomEngine.prototype) as RoomEngine;

        Object.assign(engine, { _activeRoomId: ROOM_ID, getRoomInstance: (roomId: number) => ((roomId === ROOM_ID) ? instance : null) });

        expect(engine.activeRoomHasChooserDisabled).toBe(false);

        engine.setChooserDisabled(ROOM_ID, true);

        expect(values.get(RoomVariableEnum.CHOOSER_DISABLED)).toBe(1);
        expect(engine.activeRoomHasChooserDisabled).toBe(true);

        engine.setChooserDisabled(ROOM_ID, false);

        expect(values.get(RoomVariableEnum.CHOOSER_DISABLED)).toBe(0);
        expect(engine.activeRoomHasChooserDisabled).toBe(false);
    });

    it('ignores rooms without an instance', () =>
    {
        const engine = Object.create(RoomEngine.prototype) as RoomEngine;

        Object.assign(engine, { _activeRoomId: ROOM_ID, getRoomInstance: (): null => null });

        expect(() => engine.setChooserDisabled(ROOM_ID, true)).not.toThrow();
        expect(engine.activeRoomHasChooserDisabled).toBe(false);
    });
});
