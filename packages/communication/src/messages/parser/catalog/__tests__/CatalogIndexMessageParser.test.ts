import { BinaryReader } from '@volt/utils';
import { describe, expect, it } from 'vitest';
import { EvaWireDataWrapper } from '../../../../codec/evawire/EvaWireDataWrapper';
import { CatalogIndexMessageParser } from '../CatalogIndexMessageParser';

class PacketWriter
{
    private readonly _bytes: number[] = [];

    public byte(value: number): this
    {
        this._bytes.push(value & 0xff);

        return this;
    }

    public int(value: number): this
    {
        this._bytes.push((value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff);

        return this;
    }

    public string(value: string): this
    {
        const encoded = new TextEncoder().encode(value);

        this._bytes.push((encoded.length >>> 8) & 0xff, encoded.length & 0xff, ...encoded);

        return this;
    }

    public toArrayBuffer(): ArrayBuffer
    {
        return Uint8Array.from(this._bytes).buffer;
    }
}

const createRootPacket = (declaredOffers: number, writtenOffers: number, includeSuffix: boolean = true): ArrayBuffer =>
{
    const writer = new PacketWriter()
        .byte(1)
        .int(0)
        .int(-1)
        .string('root')
        .string('')
        .int(declaredOffers);

    for(let index = 0; index < writtenOffers; index++) writer.int(index + 1);

    if(writtenOffers === declaredOffers)
    {
        writer.int(0);

        if(includeSuffix) writer.byte(0).string('NORMAL');
    }

    return writer.toArrayBuffer();
};

describe('CatalogIndexMessageParser', () =>
{
    it('parses an offer list larger than the legacy 4000 cap without misaligning the cursor', () =>
    {
        const wrapper = new EvaWireDataWrapper(0, new BinaryReader(createRootPacket(4001, 4001)));
        const parser = new CatalogIndexMessageParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect(parser.root.offerIds.length).toBe(4001);
        expect(parser.catalogType).toBe('NORMAL');
        expect(wrapper.remainingBytes).toBe(0);
    });

    it('rejects an offer count that cannot fit in the packet before the cursor becomes misaligned', () =>
    {
        const wrapper = new EvaWireDataWrapper(0, new BinaryReader(createRootPacket(1_000_000, 4)));
        const parser = new CatalogIndexMessageParser();

        expect(() => parser.parse(wrapper)).toThrowError('Catalog index packet truncated while reading offer id');
    });

    it('reports a truncated offer list without leaking a DataView RangeError', () =>
    {
        const wrapper = new EvaWireDataWrapper(0, new BinaryReader(createRootPacket(2, 1)));
        const parser = new CatalogIndexMessageParser();

        expect(() => parser.parse(wrapper)).toThrowError('Catalog index packet truncated while reading offer id');
    });

    it('parses a complete packet and leaves the catalog suffix aligned', () =>
    {
        const wrapper = new EvaWireDataWrapper(0, new BinaryReader(createRootPacket(2, 2)));
        const parser = new CatalogIndexMessageParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect(parser.root.offerIds).toEqual([ 1, 2 ]);
        expect(parser.root.children).toEqual([]);
        expect(parser.newAdditionsAvailable).toBe(false);
        expect(parser.catalogType).toBe('NORMAL');
        expect(wrapper.remainingBytes).toBe(0);
    });

    it('reports a missing catalog suffix without leaking a DataView RangeError', () =>
    {
        const wrapper = new EvaWireDataWrapper(0, new BinaryReader(createRootPacket(0, 0, false)));
        const parser = new CatalogIndexMessageParser();

        expect(() => parser.parse(wrapper)).toThrowError('Catalog index packet truncated while reading additions flag');
    });
});
