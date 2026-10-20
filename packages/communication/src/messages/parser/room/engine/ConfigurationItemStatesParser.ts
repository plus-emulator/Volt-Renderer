import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/**
 * Official `class_3013` (`ConfigurationItemStates`, 1508): the four room flags
 * `class_1902.onConfigurationItemStates` forwards to the room engine
 * (`setHanditemControlBlocked`, `setChooserDisabled`,
 * `setFreeFurniMovementsMode`, `setInvisibleFurni`). The official parser reads
 * the last three only while bytes remain.
 */
export class ConfigurationItemStatesParser implements IMessageParser
{
    private _isHanditemControlBlocked: boolean;
    private _chooserDisabled: boolean;
    private _freeFurniMovementsEnabled: boolean;
    private _invisibleFurni: boolean;
    private _fifthFlag: boolean;

    public flush(): boolean
    {
        this._isHanditemControlBlocked = false;
        this._chooserDisabled = false;
        this._freeFurniMovementsEnabled = false;
        this._invisibleFurni = false;
        this._fifthFlag = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._isHanditemControlBlocked = wrapper.readBoolean();

        // Official order: chooser, free furni movements, invisible furni. Each is read only while bytes remain.
        this._chooserDisabled = wrapper.bytesAvailable ? wrapper.readBoolean() : false;
        this._freeFurniMovementsEnabled = wrapper.bytesAvailable ? wrapper.readBoolean() : false;
        this._invisibleFurni = wrapper.bytesAvailable ? wrapper.readBoolean() : false;

        // The server sends a fifth byte. The official client ignores it; it is kept for completeness.
        this._fifthFlag = wrapper.bytesAvailable ? wrapper.readBoolean() : false;

        return true;
    }

    public get isHanditemControlBlocked(): boolean
    {
        return this._isHanditemControlBlocked;
    }

    public get chooserDisabled(): boolean
    {
        return this._chooserDisabled;
    }

    public get freeFurniMovementsEnabled(): boolean
    {
        return this._freeFurniMovementsEnabled;
    }

    public get invisibleFurni(): boolean
    {
        return this._invisibleFurni;
    }

    /** Fifth byte of 3946. Unused by the official client. */
    public get fifthFlag(): boolean
    {
        return this._fifthFlag;
    }
}
