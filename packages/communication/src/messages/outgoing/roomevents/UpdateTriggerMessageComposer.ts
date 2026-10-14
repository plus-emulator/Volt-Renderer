import { WiredSaveMessageComposer } from './WiredSaveMessageComposer';

export class UpdateTriggerMessageComposer extends WiredSaveMessageComposer
{
    constructor(id: number, ints: number[], text: string, primary: number[],
        furniSources: number[], userSources: number[], variableIds: string[], secondary: number[])
    {
        super(id, ints, text, primary, [], furniSources, userSources, variableIds, secondary);
    }
}
