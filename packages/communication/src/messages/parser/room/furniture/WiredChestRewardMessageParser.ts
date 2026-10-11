import { IMessageDataWrapper, IMessageParser } from '@octane/api';
import { IWiredTradeNode, readWiredTradeNode } from './WiredTradeRuleParser';

export class WiredChestRewardMessageParser implements IMessageParser
{
    public nodes: IWiredTradeNode[] = [];
    public text = '';
    public openByDefault = false;

    public flush(): boolean
    {
        this.nodes = [];
        this.text = '';
        this.openByDefault = false;
        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();

        try
        {
            if(!wrapper) return false;

            const count = wrapper.readInt();

            if(count < 0 || count > Math.floor(wrapper.remainingBytes / 17)) return false;

            const nodes: IWiredTradeNode[] = [];

            for(let i = 0; i < count; i++) nodes.push(readWiredTradeNode(wrapper));

            const text = wrapper.readString();
            const openByDefault = wrapper.readBoolean();

            if(wrapper.remainingBytes !== 0) return false;

            this.nodes = nodes;
            this.text = text;
            this.openByDefault = openByDefault;
            return true;
        }
        catch
        {
            return false;
        }
    }
}
