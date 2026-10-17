import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { RoomChatSettings } from './RoomChatSettings';
import { RoomModerationSettings } from './RoomModerationSettings';
import { RoomSettingsData } from './RoomSettingsData';

export class RoomSettingsDataParser implements IMessageParser
{
    private _roomSettingsData: RoomSettingsData;

    public flush(): boolean
    {
        this._roomSettingsData = null;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomSettingsData = new RoomSettingsData();

        this._roomSettingsData.roomId = wrapper.readInt();
        this._roomSettingsData.name = wrapper.readString();
        this._roomSettingsData.description = wrapper.readString();
        this._roomSettingsData.doorMode = wrapper.readInt();
        this._roomSettingsData.categoryId = wrapper.readInt();
        this._roomSettingsData.maximumVisitors = wrapper.readInt();
        this._roomSettingsData.maximumVisitorsLimit = wrapper.readInt();
        this._roomSettingsData.tags = [];

        let totalTags = wrapper.readInt();

        while(totalTags > 0)
        {
            this._roomSettingsData.tags.push(wrapper.readString());

            totalTags--;
        }

        this._roomSettingsData.tradeMode = wrapper.readInt();
        this._roomSettingsData.allowPets = (wrapper.readInt() === 1);
        this._roomSettingsData.allowFoodConsume = (wrapper.readInt() === 1);
        this._roomSettingsData.allowWalkThrough = (wrapper.readInt() === 1);
        this._roomSettingsData.hideWalls = (wrapper.readInt() === 1);
        this._roomSettingsData.wallThickness = wrapper.readInt();
        this._roomSettingsData.floorThickness = wrapper.readInt();
        // AIR WIN63-202610151745-318700621 package_105/class_3641.as:20.
        this._roomSettingsData.chatSettings = RoomChatSettings.fromFloodSensitivity(wrapper.readInt());
        this._roomSettingsData.leaveOnDoorTileEnabled = wrapper.readBoolean();
        this._roomSettingsData.idleSleepEnabled = wrapper.readBoolean();
        this._roomSettingsData.idleSleepTimeoutSeconds = wrapper.readInt();
        this._roomSettingsData.idleAutokickEnabled = wrapper.readBoolean();
        this._roomSettingsData.idleAutokickTimeoutSeconds = wrapper.readInt();
        this._roomSettingsData.muteAllPets = wrapper.readBoolean();
        this._roomSettingsData.roomModerationSettings = new RoomModerationSettings(wrapper);
        this._roomSettingsData.hiddenByBc = wrapper.readBoolean();

        return true;
    }

    public get data(): RoomSettingsData
    {
        return this._roomSettingsData;
    }
}
