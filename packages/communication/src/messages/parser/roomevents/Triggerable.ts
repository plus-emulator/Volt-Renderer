import { IMessageDataWrapper } from '@volt/api';
import { readWiredBoolean, readWiredContexts, readWiredCount, readWiredInts, WiredEditorContext, WiredInputSourcesConfiguration } from './WiredEditorData';

export class Triggerable
{
    private _furniLimit: number;
    private _stuffIds: number[];
    private _secondaryItems: number[];
    private _id: number;
    private _stringParam: string;
    private _intParams: number[];
    private _stuffTypeId: number;
    private _variableIds: string[];
    private _furniSources: number[];
    private _userSources: number[];
    protected _code: number;
    private _advanced: boolean;
    private _inputSources: WiredInputSourcesConfiguration;
    private _allowWall: boolean;
    private _contexts: WiredEditorContext[];
    private _defaultIntParams: number[];

    constructor(wrapper: IMessageDataWrapper)
    {
        this._furniLimit = wrapper.readInt();
        this._stuffIds = readWiredInts(wrapper);
        this._secondaryItems = readWiredInts(wrapper);
        this._stuffTypeId = wrapper.readInt();
        this._id = wrapper.readInt();
        this._stringParam = wrapper.readString();
        this._intParams = readWiredInts(wrapper);
        this._variableIds = Array.from({ length: readWiredCount(wrapper) }, () => wrapper.readString());
        this._furniSources = readWiredInts(wrapper);
        this._userSources = readWiredInts(wrapper);
        this._code = wrapper.readInt();
    }

    protected readFooter(wrapper: IMessageDataWrapper, readTypeSpecifics?: () => void): void
    {
        this._advanced = readWiredBoolean(wrapper);
        this._inputSources = {
            furniAllowed: Array.from({ length: readWiredCount(wrapper) }, () => readWiredInts(wrapper)),
            usersAllowed: Array.from({ length: readWiredCount(wrapper) }, () => readWiredInts(wrapper)),
            furniDefaults: readWiredInts(wrapper), userDefaults: readWiredInts(wrapper)
        };
        this._allowWall = readWiredBoolean(wrapper);
        readTypeSpecifics?.();
        this._contexts = readWiredContexts(wrapper);
        this._defaultIntParams = readWiredInts(wrapper);
        if(wrapper.bytesAvailable) throw new Error('Trailing Wired editor data');
    }

    public getBoolean(index: number): boolean
    {
        return this._intParams[index] === 1;
    }
    public get maximumItemSelectionCount(): number
    {
        return this._furniLimit;
    }
    public get selectedItems(): number[]
    {
        return this._stuffIds;
    }
    public get secondarySelectedItems(): number[]
    {
        return this._secondaryItems;
    }
    public get id(): number
    {
        return this._id;
    }
    public get stringData(): string
    {
        return this._stringParam;
    }
    public get intData(): number[]
    {
        return this._intParams;
    }
    public get code(): number
    {
        return this._code;
    }
    public get spriteId(): number
    {
        return this._stuffTypeId;
    }
    public get variableIds(): string[]
    {
        return this._variableIds;
    }
    public get furniSources(): number[]
    {
        return this._furniSources;
    }
    public get userSources(): number[]
    {
        return this._userSources;
    }
    public get inputSources(): WiredInputSourcesConfiguration
    {
        return this._inputSources;
    }
    public get advanced(): boolean
    {
        return this._advanced;
    }
    public get allowWall(): boolean
    {
        return this._allowWall;
    }
    public get contexts(): WiredEditorContext[]
    {
        return this._contexts;
    }
    public get defaultIntParams(): number[]
    {
        return this._defaultIntParams;
    }
}
