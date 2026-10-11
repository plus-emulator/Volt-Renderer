import { IMessageDataWrapper, IMessageParser } from '@octane/api';

export class WiredChestSettingsAckParser implements IMessageParser
{
    public chestId = 0;
    public saved = false;

    public flush(): boolean
    {
        this.chestId = 0;
        this.saved = false;
        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();

        try
        {
            if(!wrapper) return false;

            const chestId = wrapper.readInt() >>> 0;
            const saved = wrapper.readBoolean();

            if(wrapper.remainingBytes !== 0) return false;

            this.chestId = chestId;
            this.saved = saved;
            return true;
        }
        catch
        {
            return false;
        }
    }
}
