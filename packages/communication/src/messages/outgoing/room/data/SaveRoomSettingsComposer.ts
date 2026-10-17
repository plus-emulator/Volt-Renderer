import { IMessageComposer } from '@volt/api';

/**
 * AIR WIN63-202610151745-318700621 package_157/class_3305.as:12. Empty tags are dropped and a null
 * password goes out as an empty string, as AIR does.
 */
export class SaveRoomSettingsComposer implements IMessageComposer<(string | number | boolean)[]>
{
    private _data: (string | number | boolean)[];

    constructor(
        roomId: number,
        roomName: string,
        roomDescription: string,
        lockState: number,
        password: string,
        userCount: number,
        categoryId: number,
        tags: string[],
        tradeState: number,
        allowPets: boolean,
        allowPetsEat: boolean,
        allowWalkthrough: boolean,
        hideWalls: boolean,
        wallThickness: number,
        floorThickness: number,
        muteState: number,
        kickState: number,
        banState: number,
        chatFloodProtection: number,
        leaveOnDoorTileEnabled: boolean,
        idleSleepEnabled: boolean,
        idleSleepTimeoutSeconds: number,
        idleAutokickEnabled: boolean,
        idleAutokickTimeoutSeconds: number,
        muteAllPets: boolean
    )
    {
        const validTags = (tags ?? []).filter(tag => !!tag);

        this._data = [
            roomId,
            roomName,
            roomDescription,
            lockState,
            (password ?? ''),
            userCount,
            categoryId,
            validTags.length,
            ...validTags,
            tradeState,
            allowPets,
            allowPetsEat,
            allowWalkthrough,
            hideWalls,
            wallThickness,
            floorThickness,
            muteState,
            kickState,
            banState,
            chatFloodProtection,
            leaveOnDoorTileEnabled,
            idleSleepEnabled,
            idleSleepTimeoutSeconds,
            idleAutokickEnabled,
            idleAutokickTimeoutSeconds,
            muteAllPets
        ];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
