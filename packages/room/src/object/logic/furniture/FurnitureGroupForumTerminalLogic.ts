import { RoomObjectVariable } from '@volt/api';
import { RoomObjectWidgetRequestEvent } from '@volt/events';
import { FurnitureGuildCustomizedLogic } from './FurnitureGuildCustomizedLogic';

/**
 * The group forum terminal (furniture_group_forum_terminal, AIR class_2009): a group furni whose double click opens
 * the forum of its group through the internal link "groupforum/<group id>". A single click only selects it: AIR
 * overrides openContextMenu with an empty body, so the group furni context menu is never asked for.
 */
export class FurnitureGroupForumTerminalLogic extends FurnitureGuildCustomizedLogic
{
    public getEventTypes(): string[]
    {
        const types = [
            RoomObjectWidgetRequestEvent.INERNAL_LINK
        ];

        return this.mergeTypes(super.getEventTypes(), types);
    }

    protected openContextMenu(): void
    {
        return;
    }

    protected updateGroupId(id: string): void
    {
        super.updateGroupId(id);

        this.object.model.setValue(RoomObjectVariable.FURNITURE_INTERNAL_LINK, `groupforum/${id}`);
    }

    public useObject(): void
    {
        if(!this.object || !this.eventDispatcher) return;

        this.eventDispatcher.dispatchEvent(new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.INERNAL_LINK, this.object));

        super.useObject();
    }
}
