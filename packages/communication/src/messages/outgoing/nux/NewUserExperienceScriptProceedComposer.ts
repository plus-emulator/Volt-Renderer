import { IMessageComposer } from '@volt/api';

/**
 * AIR WIN63-202610151745-318700621 package_171/class_3136.as:12 (`RoomSession.sendScriptProceed`): no fields.
 */
export class NewUserExperienceScriptProceedComposer implements IMessageComposer<[]>
{
    private _data: [] = [];

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
