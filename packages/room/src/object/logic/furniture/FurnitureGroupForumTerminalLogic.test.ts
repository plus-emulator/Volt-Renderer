import { IEventDispatcher, IRoomGeometry, IRoomObjectController, IRoomObjectModel, IVector3D, MouseEventType, RoomObjectVariable, StringDataType } from '@volt/api';
import { RoomObjectBadgeAssetEvent, RoomObjectEvent, RoomObjectMouseEvent, RoomObjectStateChangedEvent, RoomObjectWidgetRequestEvent, RoomSpriteMouseEvent } from '@volt/events';
import { Vector3d } from '@volt/utils';
import { describe, expect, it } from 'vitest';
import { ObjectDataUpdateMessage } from '../../../messages';
import { FurnitureGroupForumTerminalLogic } from './FurnitureGroupForumTerminalLogic';
import { FurnitureGuildCustomizedLogic } from './FurnitureGuildCustomizedLogic';

const setup = (logic: FurnitureGuildCustomizedLogic) =>
{
    const store = new Map<string, unknown>();
    const model = {
        getValue: (key: string) => store.get(key),
        setValue: (key: string, value: unknown) => store.set(key, value)
    } as unknown as IRoomObjectModel;
    const location = new Vector3d();
    const direction = new Vector3d();
    const object = {
        id: 42,
        type: 'guild_forum',
        getLocation: () => location,
        setLocation: (vector: IVector3D) => vector && location.assign(vector),
        getDirection: () => direction,
        setDirection: (vector: IVector3D) => vector && direction.assign(vector),
        setLogic: () => null,
        setState: () => true,
        model
    } as unknown as IRoomObjectController;
    const events: RoomObjectEvent[] = [];

    logic.setObject(object);
    logic.eventDispatcher = { dispatchEvent: (event: RoomObjectEvent) => events.push(event) } as unknown as IEventDispatcher;

    return { events, store };
};

const guildData = (values: string[]) =>
{
    const data = new StringDataType();

    data.setValue(values);

    return data;
};

const mouse = (type: string) => new RoomSpriteMouseEvent(type, 'event', 'canvas', '', 0, 0);
const geometry = {} as IRoomGeometry;

describe('FurnitureGroupForumTerminalLogic', () =>
{
    it('reads the group furni string array like FurnitureGuildCustomizedLogic and links the terminal to the forum of its group', () =>
    {
        const logic = new FurnitureGroupForumTerminalLogic();
        const { events, store } = setup(logic);

        logic.processUpdateMessage(new ObjectDataUpdateMessage(0, guildData(['0', '17', 'b0503Xs09114', 'ff0000', '00ff00'])));

        expect(store.get(RoomObjectVariable.FURNITURE_GUILD_CUSTOMIZED_GUILD_ID)).toBe(17);
        expect(store.get(RoomObjectVariable.FURNITURE_GUILD_CUSTOMIZED_COLOR_1)).toBe(0xFF0000);
        expect(store.get(RoomObjectVariable.FURNITURE_GUILD_CUSTOMIZED_COLOR_2)).toBe(0x00FF00);
        expect(store.get(RoomObjectVariable.FURNITURE_INTERNAL_LINK)).toBe('groupforum/17');
        const badgeEvent = events.find(event => (event.type === RoomObjectBadgeAssetEvent.LOAD_BADGE)) as RoomObjectBadgeAssetEvent;

        expect(badgeEvent?.badgeId).toBe('b0503Xs09114');
        expect(badgeEvent?.groupBadge).toBe(true);
    });

    it('only selects on a single click: no group furni context menu, so no GetGuildFurniContextMenuInfo', () =>
    {
        const logic = new FurnitureGroupForumTerminalLogic();
        const { events } = setup(logic);

        logic.mouseEvent(mouse(MouseEventType.MOUSE_CLICK), geometry);

        expect(events.map(event => event.type)).toEqual([RoomObjectMouseEvent.CLICK]);
        expect(events.some(event => (event.type === RoomObjectWidgetRequestEvent.GUILD_FURNI_CONTEXT_MENU))).toBe(false);
    });

    it('opens the forum link and uses the furni on a double click', () =>
    {
        const logic = new FurnitureGroupForumTerminalLogic();
        const { events } = setup(logic);

        logic.mouseEvent(mouse(MouseEventType.DOUBLE_CLICK), geometry);

        expect(events.map(event => event.type)).toEqual([RoomObjectWidgetRequestEvent.INERNAL_LINK, RoomObjectStateChangedEvent.STATE_CHANGE]);
    });

    it('keeps the group furni context menu on other group furniture', () =>
    {
        const logic = new FurnitureGuildCustomizedLogic();
        const { events } = setup(logic);

        logic.mouseEvent(mouse(MouseEventType.MOUSE_CLICK), geometry);

        expect(events.map(event => event.type)).toEqual([RoomObjectWidgetRequestEvent.GUILD_FURNI_CONTEXT_MENU, RoomObjectMouseEvent.CLICK]);
    });
});
