import { describe, expect, it } from 'vitest';
import { BinaryReader, BinaryWriter } from '@volt/utils';
import { FriendNotificationParser } from '../FriendNotificationParser';

class TestWrapper
{
    constructor(private reader: BinaryReader)
    {}
    readByte()
    {
        return this.reader.readByte();
    }
    readShort()
    {
        return this.reader.readShort();
    }
    readInt()
    {
        return this.reader.readInt();
    }
    readString()
    {
        const len = this.reader.readShort(); return this.reader.readBytes(len).toString();
    }
    header = 0;
    get bytesAvailable()
    {
        return this.reader.remaining() > 0;
    }
}

describe('FriendNotificationParser', () =>
{
    it('reads the AIR order: string avatar id, int type, string message', () =>
    {
        const w = new BinaryWriter();
        w.writeString('42'); w.writeInt(1); w.writeString('ACH_RoomEntry3');
        const parser = new FriendNotificationParser();
        parser.flush();
        parser.parse(new TestWrapper(new BinaryReader(w.getBuffer())) as any);
        expect(parser.avatarId).toBe(42);
        expect(parser.typeCode).toBe(1);
        expect(parser.message).toBe('ACH_RoomEntry3');
    });
});
