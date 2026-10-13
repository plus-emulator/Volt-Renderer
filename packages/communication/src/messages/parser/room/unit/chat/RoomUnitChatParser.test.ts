import { BinaryReader, BinaryWriter } from '@octane/utils';
import { describe, expect, it } from 'vitest';
import { RoomUnitChatParser } from './RoomUnitChatParser';

class TestWrapper
{
    constructor(private reader: BinaryReader)
    {}
    readByte()
    {
        return this.reader.readByte();
    }
    readBoolean()
    {
        return this.reader.readByte() === 1;
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
        const length = this.reader.readShort(); return this.reader.readBytes(length).toString();
    }
    header = 0;
    get bytesAvailable()
    {
        return this.reader.remaining() > 0;
    }
    get remainingBytes()
    {
        return this.reader.remaining();
    }
}

const wrapper = (writer: BinaryWriter) => new TestWrapper(new BinaryReader(writer.getBuffer())) as any;

/** The chat packet as the emulator writes it, up to the optional tail. */
const chatPacket = () =>
{
    const writer = new BinaryWriter();
    writer.writeInt(7); writer.writeString('hello'); writer.writeInt(0); writer.writeInt(34);
    writer.writeInt(0); writer.writeInt(5);
    return writer;
};

describe('RoomUnitChatParser bubble width override', () =>
{
    it('answers -1 when the packet carries no override, so the room setting rules', () =>
    {
        const parser = new RoomUnitChatParser();

        expect(parser.parse(wrapper(chatPacket()))).toBe(true);
        expect(parser.message).toBe('hello');
        expect(parser.bubbleWidthOverride).toBe(-1);
    });

    it('reads the override the wired asked for from the tail of the packet', () =>
    {
        const writer = chatPacket();
        writer.writeInt(-1);
        writer.writeInt(2);
        const parser = new RoomUnitChatParser();

        expect(parser.parse(wrapper(writer))).toBe(true);
        expect(parser.bubbleWidthOverride).toBe(2);
    });

    it('forgets the override between packets', () =>
    {
        const parser = new RoomUnitChatParser();
        const writer = chatPacket();
        writer.writeInt(-1);
        writer.writeInt(0);
        parser.parse(wrapper(writer));
        parser.flush();

        expect(parser.bubbleWidthOverride).toBe(-1);
    });
});
