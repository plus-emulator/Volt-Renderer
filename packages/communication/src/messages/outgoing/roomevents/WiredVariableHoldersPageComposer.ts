import { IMessageComposer } from '@volt/api';

/**
 * Official AIR 13 `VariableManagementOverviewView` page request:
 * one page of the holders of a single wired variable, with the sort and user-type filters, in that order.
 * Sort 0-5 is highest value, lowest value, oldest and latest creation, oldest and latest update. User type -1 is all, 1 Habbo, 2 pet, 4 bot.
 */
export class WiredVariableHoldersPageComposer implements IMessageComposer<ConstructorParameters<typeof WiredVariableHoldersPageComposer>>
{
    private _data: ConstructorParameters<typeof WiredVariableHoldersPageComposer>;

    constructor(variableId: string, page: number, pageSize: number, sortTypeFilter: number, userTypeFilter: number)
    {
        this._data = [ variableId, page, pageSize, sortTypeFilter, userTypeFilter ];
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
