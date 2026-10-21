import { IMessageDataWrapper, IMessageParser } from '@volt/api';

/** AIR parser/collectibles/class_4209: the user's wallets, the Collector Wallet first. */
export class CollectibleWalletAddressesMessageParser implements IMessageParser
{
    private _stardustWalletAddress: string = null;
    private _walletAddresses: string[] = [];

    public flush(): boolean
    {
        this._stardustWalletAddress = null;
        this._walletAddresses = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stardustWalletAddress = wrapper.readString();
        this._walletAddresses = [];

        if(this._stardustWalletAddress !== '') this._walletAddresses.push(this._stardustWalletAddress);

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._walletAddresses.push(wrapper.readString());

        return true;
    }

    public get walletAddresses(): string[]
    {
        return this._walletAddresses;
    }

    public get stardustWalletAddress(): string
    {
        return this._stardustWalletAddress;
    }
}
