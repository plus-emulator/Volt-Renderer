import { IMessageEvent } from '@volt/api';
import { MessageEvent } from '@volt/events';
import { WiredFurniSelectorParser, WiredFurniAddonParser, WiredFurniVariableParser } from '../../parser';

export class WiredFurniSelectorEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: Function)
    {
        super(callback, WiredFurniSelectorParser);
    }
    public getParser(): WiredFurniSelectorParser
    {
        return this.parser as WiredFurniSelectorParser;
    }
}


export class WiredFurniAddonEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: Function)
    {
        super(callback, WiredFurniAddonParser);
    }
    public getParser(): WiredFurniAddonParser
    {
        return this.parser as WiredFurniAddonParser;
    }
}


export class WiredFurniVariableEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: Function)
    {
        super(callback, WiredFurniVariableParser);
    }
    public getParser(): WiredFurniVariableParser
    {
        return this.parser as WiredFurniVariableParser;
    }
}
