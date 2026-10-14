import { IMessageDataWrapper } from '@volt/api';
import { WiredVariableHoldersPageParser } from './WiredVariableHoldersPageParser';
import { readWiredInt64 } from './WiredInt64';

export class WiredVariableHoldersPage64Parser extends WiredVariableHoldersPageParser<bigint>
{
    protected readScalarValue(wrapper: IMessageDataWrapper): bigint
    {
        return readWiredInt64(wrapper);
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();
        try
        {
            if(!wrapper || wrapper.readInt() !== 1) return false;
            if(super.parse(wrapper) && (wrapper.remainingBytes === undefined ? !wrapper.bytesAvailable : wrapper.remainingBytes === 0)) return true;
            this.flush();
            return false;
        }
        catch
        {
            this.flush();
            return false;
        }
    }
}
