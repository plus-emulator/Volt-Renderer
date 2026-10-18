import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { SelectedNftWardrobeOutfitMessageParser } from '../../parser';

export class SelectedNftWardrobeOutfitMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, SelectedNftWardrobeOutfitMessageParser);
    }

    public getParser(): SelectedNftWardrobeOutfitMessageParser
    {
        return this.parser as SelectedNftWardrobeOutfitMessageParser;
    }
}
