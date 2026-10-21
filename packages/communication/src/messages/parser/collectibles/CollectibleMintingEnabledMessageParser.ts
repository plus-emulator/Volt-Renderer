import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_4334: whether minting is turned on. */
export class CollectibleMintingEnabledMessageParser implements IMessageParser
{
    private _enabled: boolean = false;

    public flush(): boolean
    {
        this._enabled = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._enabled = wrapper.readBoolean();

        return true;
    }

    public get enabled(): boolean
    {
        return this._enabled;
    }
}
