import { describe, expect, it, vi } from 'vitest';
import { RoomMessageHandler } from './RoomMessageHandler';

vi.mock('./GetRoomMessageHandler', () => ({
    GetRoomMessageHandler: () => ({})
}));

vi.mock('./GetRoomEngine', () => ({
    GetRoomEngine: () => null
}));

const ROOM_ID = 9;

const createHandler = () =>
{
    const roomEngine = { setHanditemControlBlocked: vi.fn(), setChooserDisabled: vi.fn(), setFreeFurniMovementsMode: vi.fn(), setInvisibleFurni: vi.fn() };
    const handler = Object.create(RoomMessageHandler.prototype) as RoomMessageHandler;

    Object.assign(handler, { _roomEngine: roomEngine, _currentRoomId: ROOM_ID });

    return { handler, roomEngine };
};

const dispatch = (handler: RoomMessageHandler, parser: { isHanditemControlBlocked?: boolean; chooserDisabled: boolean; freeFurniMovementsEnabled: boolean; invisibleFurni?: boolean }) =>
{
    (handler as unknown as { onConfigurationItemStatesEvent: (event: unknown) => void }).onConfigurationItemStatesEvent({ getParser: () => parser });
};

describe('RoomMessageHandler ConfigurationItemStates', () =>
{
    it('forwards the chooser disabler flag to the room engine (AIR onConfigurationItemStates)', () =>
    {
        const { handler, roomEngine } = createHandler();

        dispatch(handler, { chooserDisabled: true, freeFurniMovementsEnabled: false });

        expect(roomEngine.setChooserDisabled).toHaveBeenCalledWith(ROOM_ID, true);
        expect(roomEngine.setFreeFurniMovementsMode).toHaveBeenCalledWith(ROOM_ID, false);

        dispatch(handler, { chooserDisabled: false, freeFurniMovementsEnabled: true });

        expect(roomEngine.setChooserDisabled).toHaveBeenLastCalledWith(ROOM_ID, false);
        expect(roomEngine.setFreeFurniMovementsMode).toHaveBeenLastCalledWith(ROOM_ID, true);
    });
});
