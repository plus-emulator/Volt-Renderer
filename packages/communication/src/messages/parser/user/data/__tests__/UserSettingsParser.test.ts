import { describe, expect, it } from 'vitest';
import { BinaryReader, BinaryWriter } from '@volt/utils';
import { UserSettingsParser } from '../UserSettingsParser';

class TestWrapper
{
    constructor(private reader: BinaryReader)
    {}
    readByte()
    {
        return this.reader.readByte();
    }
    readBytes(length: number)
    {
        return this.reader.readBytes(length);
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
    readFloat()
    {
        return this.reader.readFloat();
    }
    readDouble()
    {
        return this.reader.readDouble();
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

const writeLegacySettings = (writer: BinaryWriter, wiredMenuButton = true) =>
{
    writer.writeInt(10);
    writer.writeInt(20);
    writer.writeInt(30);
    writer.writeByte(1);
    writer.writeByte(0);
    writer.writeByte(1);
    writer.writeInt(12);
    writer.writeInt(4);
    writer.writeByte(wiredMenuButton ? 1 : 0);
    writer.writeByte(0);
    writer.writeByte(1);
};

describe('UserSettingsParser per-user preferences', () =>
{
    const parse = (writer: BinaryWriter) =>
    {
        const parser = new UserSettingsParser();
        parser.flush();
        expect(parser.parse(new TestWrapper(new BinaryReader(writer.getBuffer())) as any)).toBe(true);
        return parser;
    };

    it('reads the trailing wired whisper, chat and friend-online preferences', () =>
    {
        const writer = new BinaryWriter();
        writeLegacySettings(writer);
        writer.writeInt(0);
        writer.writeByte(1);
        writer.writeByte(0);
        writer.writeShort(0);
        writer.writeInt(0);
        writer.writeInt(1);
        writer.writeInt(2);
        writer.writeInt(0);
        writer.writeInt(2);

        const parser = parse(writer);

        expect(parser.wiredWhisperDisabled).toBe(true);
        expect(parser.chatMode).toBe(1);
        expect(parser.chatBubbleWidth).toBe(2);
        expect(parser.chatScrollSpeed).toBe(0);
        expect(parser.onlineIndicatorPreference).toBe(2);
    });

    it('reads the wired menu button preference', () =>
    {
        const writer = new BinaryWriter();
        writeLegacySettings(writer, false);
        writer.writeInt(0);
        writer.writeByte(0);
        writer.writeByte(0);
        writer.writeShort(0);
        writer.writeInt(0);
        writer.writeInt(1);
        writer.writeInt(2);
        writer.writeInt(0);
        writer.writeInt(2);

        expect(parse(writer).wiredMenuButton).toBe(false);
    });

    it('keeps the profile visible when the emulator does not send the flag', () =>
    {
        const writer = new BinaryWriter();
        writeLegacySettings(writer);

        expect(parse(writer).profileVisible).toBe(true);
    });
});
