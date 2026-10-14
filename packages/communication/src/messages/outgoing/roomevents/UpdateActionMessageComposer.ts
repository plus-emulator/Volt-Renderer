import { WiredSaveMessageComposer } from './WiredSaveMessageComposer';

export class UpdateActionMessageComposer extends WiredSaveMessageComposer
{
    constructor(id: number, ints: number[], text: string, primary: number[], delay: number,
        furniSources: number[], userSources: number[], variableIds: string[], secondary: number[])
    {
        super(id, ints, text, primary, [delay], furniSources, userSources, variableIds, secondary);
    }
}
