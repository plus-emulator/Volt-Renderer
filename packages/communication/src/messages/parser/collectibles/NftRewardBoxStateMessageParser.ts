import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { NftProductData } from './NftProductData';

/** AIR parser/collectibles/class_2564: a reward box opening, state 0 start and 1 finish. */
export class NftRewardBoxStateMessageParser implements IMessageParser
{
    private _state: number = -1;
    private _openerAvatarId: number = -1;
    private _reward: NftProductData = null;

    public flush(): boolean
    {
        this._state = -1;
        this._openerAvatarId = -1;
        this._reward = null;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._state = wrapper.readShort();
        this._openerAvatarId = wrapper.readInt();
        this._reward = new NftProductData(wrapper);

        return true;
    }

    public get reward(): NftProductData
    {
        return this._reward;
    }

    public get start(): boolean
    {
        return this._state === 0;
    }

    public get finish(): boolean
    {
        return this._state === 1;
    }

    public get state(): number
    {
        return this._state;
    }

    public get openerAvatarId(): number
    {
        return this._openerAvatarId;
    }
}
