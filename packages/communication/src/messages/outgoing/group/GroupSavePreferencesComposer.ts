import { IMessageComposer } from '@volt/api';

export class GroupSavePreferencesComposer implements IMessageComposer<ConstructorParameters<typeof GroupSavePreferencesComposer>>
{
    private _data: ConstructorParameters<typeof GroupSavePreferencesComposer>;

    // AIR WIN63-202610151745-318700621 package_25/class_3302.as:11 sends (groupId, state, onlyAdminCanDecorate).
    // The forum flag is a Volt extension, appended only when the forum toggle changed.
    constructor(groupId: number, state: number, onlyAdminCanDecorate: number, forumEnabled?: boolean)
    {
        this._data = [groupId, state, onlyAdminCanDecorate];

        if(forumEnabled !== undefined) this._data.push(forumEnabled);
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
