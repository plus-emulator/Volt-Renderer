import { IMessageComposer } from '@volt/api';

/** One canonical counted-array body. No scalar-tail or revision-profile fallback. */
export abstract class WiredSaveMessageComposer implements IMessageComposer<unknown[]>
{
    private _data: unknown[];
    protected constructor(id: number, ints: number[], text: string, primary: number[], categoryFields: (number | boolean)[],
        furniSources: number[], userSources: number[], variableIds: string[], secondary: number[])
    {
        this._data = [id, ints.length, ...ints, text, primary.length, ...primary, ...categoryFields,
            furniSources.length, ...furniSources, userSources.length, ...userSources,
            variableIds.length, ...variableIds, secondary.length, ...secondary];
    }
    public getMessageArray(): unknown[]
    {
        return this._data;
    }
    public dispose(): void
    {
        return;
    }
}

export class UpdateSelectorMessageComposer extends WiredSaveMessageComposer
{
    constructor(id: number, ints: number[], text: string, primary: number[], filter: boolean, inverse: boolean,
        furniSources: number[], userSources: number[], variableIds: string[], secondary: number[])
    {
        super(id, ints, text, primary, [filter, inverse], furniSources, userSources, variableIds, secondary);
    }
}

export class UpdateAddonMessageComposer extends WiredSaveMessageComposer
{
    constructor(id: number, ints: number[], text: string, primary: number[],
        furniSources: number[], userSources: number[], variableIds: string[], secondary: number[])
    {
        super(id, ints, text, primary, [], furniSources, userSources, variableIds, secondary);
    }
}

export class UpdateVariableMessageComposer extends WiredSaveMessageComposer
{
    constructor(id: number, ints: number[], text: string, primary: number[],
        furniSources: number[], userSources: number[], variableIds: string[], secondary: number[])
    {
        super(id, ints, text, primary, [], furniSources, userSources, variableIds, secondary);
    }
}
