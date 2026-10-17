import { BinaryReader } from '@volt/utils';
import { describe, expect, it } from 'vitest';
import { EvaWireDataWrapper } from '../../../../codec/evawire/EvaWireDataWrapper';
import { CatalogPageMessageParser } from '../CatalogPageMessageParser';

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

const writeOffer = (writer: PacketWriter, offerId: number): void =>
{
    writer
        .int(offerId) // offerId
        .string(`item_${ offerId }`) // localizationId
        .byte(0) // rent
        .int(3) // priceCredits
        .int(0) // priceActivityPoints
        .int(0) // priceActivityPointsType
        .int(0) // priceSilver
        .byte(1) // giftable
        .int(1) // product count
        .string('s') // productType (floor)
        .int(offerId) // furniClassId
        .string('') // extraParam
        .int(1) // productCount
        .byte(0) // uniqueLimitedItem
        .int(1) // clubLevel
        .byte(0) // bundlePurchaseAllowed
        .byte(0) // isPet
        .string(''); // previewImage
};

const createPagePacket = (declaredOffers: number, writtenOffers: number): ArrayBuffer =>
{
    const writer = new PacketWriter()
        .int(1) // pageId
        .string('NORMAL') // catalogType
        .string('default_3x3') // layoutCode
        .int(0) // localization images
        .int(0) // localization texts
        .int(declaredOffers);

    for(let index = 0; index < writtenOffers; index++) writeOffer(writer, index + 1);

    if(writtenOffers === declaredOffers)
    {
        writer
            .int(-1) // offerId
            .byte(0); // acceptSeasonCurrencyAsCredits
    }

    return writer.toArrayBuffer();
};

describe('CatalogPageMessageParser', () =>
{
    it('parses a page with more offers than the legacy 1000 cap and stays byte-aligned', () =>
    {
        const wrapper = new EvaWireDataWrapper(0, new BinaryReader(createPagePacket(1005, 1005)));
        const parser = new CatalogPageMessageParser();

        parser.flush();

        expect(parser.parse(wrapper)).toBe(true);
        expect(parser.offers.length).toBe(1005);
        expect(parser.offers[0].offerId).toBe(1);
        expect(parser.offers[1004].offerId).toBe(1005);
        expect(parser.offers[1004].products.length).toBe(1);
        expect(parser.offerId).toBe(-1);
        expect(parser.acceptSeasonCurrencyAsCredits).toBe(false);
        expect(wrapper.remainingBytes).toBe(0);
    });

    it('rejects an offer count that cannot fit in the packet instead of desyncing the stream', () =>
    {
        const wrapper = new EvaWireDataWrapper(0, new BinaryReader(createPagePacket(1_000_000, 2)));
        const parser = new CatalogPageMessageParser();

        parser.flush();

        expect(() => parser.parse(wrapper)).toThrowError(/cannot fit/);
    });
});
