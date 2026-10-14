import { IMessageDataWrapper, IMessageParser } from '@volt/api';
import { nativeCatalogAtEnd } from './WiredNativeVariableData';

export class WiredAllVariablesHashParser implements IMessageParser
{
    private _allVariablesHash: number;

    public flush(): boolean
    {
        this._allVariablesHash = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();
        try
        {
            if(!wrapper) return false;
            const hash = wrapper.readInt();
            if(!nativeCatalogAtEnd(wrapper)) return false;
            this._allVariablesHash = hash;
            return true;
        }
        catch
        {
            this.flush();
            return false;
        }
    }

    public get allVariablesHash(): number
    {
        return this._allVariablesHash;
    }
}
