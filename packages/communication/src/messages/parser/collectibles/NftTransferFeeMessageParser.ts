import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_4225: the silver fee to transfer collectibles. */
export class NftTransferFeeMessageParser implements IMessageParser
{
    private _transferFee: number = 0;

    public flush(): boolean
    {
        this._transferFee = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._transferFee = wrapper.readInt();

        return true;
    }

    public get transferFee(): number
    {
        return this._transferFee;
    }
}
