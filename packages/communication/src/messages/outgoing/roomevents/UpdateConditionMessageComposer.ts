import { WiredSaveMessageComposer } from './WiredSaveMessageComposer';

export class UpdateConditionMessageComposer extends WiredSaveMessageComposer
{
    constructor(id: number, ints: number[], text: string, primary: number[], quantifier: number,
        furniSources: number[], userSources: number[], variableIds: string[], secondary: number[])
    {
        super(id, ints, text, primary, [quantifier], furniSources, userSources, variableIds, secondary);
    }
}
