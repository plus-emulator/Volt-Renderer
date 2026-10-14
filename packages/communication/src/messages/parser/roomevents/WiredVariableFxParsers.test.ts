import { BinaryReader, BinaryWriter } from '@volt/utils';
import { describe, expect, it } from 'vitest';
import { WiredVariableFxConfigsParser } from './WiredVariableFxConfigsParser';
import { WiredVariableFxConfigsRemovedParser } from './WiredVariableFxConfigsRemovedParser';
import { parseWiredVariableFxStatusKey, wiredVariableFxStatusKey } from './WiredVariableFxData';
import { WiredVariableFxStatusParser } from './WiredVariableFxStatusParser';
import { WiredVariableFxStatusRemovedParser } from './WiredVariableFxStatusRemovedParser';

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

describe('WiredVariableFxConfigsParser', () =>
{
    it('reads a config with its long range and extras', () =>
    {
        const writer = new BinaryWriter();

        writer.writeInt(1);
        writer.writeInt(0x01020304); // configId
        writer.writeByte(1); // userFx
        writer.writeInt(1); // showMode
        writer.writeInt(3); // updateMask
        writer.writeByte(0); // showOnMouseHover
        writer.writeInt(1500); // showDurationMs
        writer.writeInt(0); // category
        writer.writeInt(2); // styleId
        writer.writeInt(1); // colorId
        writer.writeInt(0); // widthId
        writer.writeInt(7); // rendererId
        writer.writeInt(-1).writeInt(-5 >>> 0); // min -5 as high / low halves
        writer.writeInt(1).writeInt(5); // max 2^32 + 5
        writer.writeInt(1);
        writer.writeString('segments').writeString('4');

        const parser = new WiredVariableFxConfigsParser();

        expect(parser.parse(wrapper(writer))).toBe(true);
        expect(parser.configs).toHaveLength(1);
        expect(parser.configs[0]).toEqual({
            configId: 0x01020304,
            userFx: true,
            showMode: 1,
            updateMask: 3,
            showOnMouseHover: false,
            showDurationMs: 1500,
            category: 0,
            styleId: 2,
            colorId: 1,
            widthId: 0,
            rendererId: 7,
            defaultMinValue: -5n,
            defaultMaxValue: 0x100000005n,
            extra: { segments: '4' }
        });
    });

    it('reads removed config ids', () =>
    {
        const writer = new BinaryWriter();

        writer.writeInt(2).writeInt(10).writeInt(11);

        const parser = new WiredVariableFxConfigsRemovedParser();

        expect(parser.parse(wrapper(writer))).toBe(true);
        expect(parser.configIds).toEqual([ 10, 11 ]);
    });
});

describe('WiredVariableFxStatusParser', () =>
{
    it('splits the config from the variable id and reads the override pair only when present', () =>
    {
        const writer = new BinaryWriter();

        writer.writeByte(0); // initializeAll
        writer.writeInt(2);

        writer.writeString('7|user:42');
        writer.writeByte(1); // initialize
        writer.writeByte(1); // userEntity
        writer.writeInt(9); // entityId
        writer.writeInt(0).writeInt(60); // value
        writer.writeByte(0); // no overrides
        writer.writeInt(0);

        writer.writeString('7|furni:3');
        writer.writeByte(0);
        writer.writeByte(0);
        writer.writeInt(0x01020305);
        writer.writeInt(-1).writeInt(-5 >>> 0); // value -5
        writer.writeByte(1);
        writer.writeInt(0).writeInt(1); // min
        writer.writeInt(0).writeInt(200); // max
        writer.writeInt(1);
        writer.writeString('current_level').writeString('3');

        const parser = new WiredVariableFxStatusParser();

        expect(parser.parse(wrapper(writer))).toBe(true);
        expect(parser.initializeAll).toBe(false);
        expect(parser.statuses).toHaveLength(2);
        expect(parser.statuses[0]).toEqual({
            configId: 7,
            variableId: 'user:42',
            initialize: true,
            userEntity: true,
            entityId: 9,
            value: 60n,
            overrideMinValue: null,
            overrideMaxValue: null,
            extra: {}
        });
        expect(parser.statuses[1]).toEqual({
            configId: 7,
            variableId: 'furni:3',
            initialize: false,
            userEntity: false,
            entityId: 0x01020305,
            value: -5n,
            overrideMinValue: 1n,
            overrideMaxValue: 200n,
            extra: { current_level: '3' }
        });
        expect(wiredVariableFxStatusKey(parser.statuses[1])).toBe('7|furni:3|f|16909061');
    });

    it('reads removal keys and drops the ones it cannot split', () =>
    {
        const writer = new BinaryWriter();

        writer.writeInt(3);
        writer.writeString('7|user:42|u|9');
        writer.writeString('broken');
        writer.writeString('8|furni:3|f|500');

        const parser = new WiredVariableFxStatusRemovedParser();

        expect(parser.parse(wrapper(writer))).toBe(true);
        expect(parser.keys).toEqual([
            { configId: 7, variableId: 'user:42', userEntity: true, entityId: 9 },
            { configId: 8, variableId: 'furni:3', userEntity: false, entityId: 500 }
        ]);
        expect(parseWiredVariableFxStatusKey('x|user:1|u|2')).toBeNull();
    });
});
