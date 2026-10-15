import { BinaryReader, BinaryWriter } from '@volt/utils';
import { describe, expect, it } from 'vitest';
import { EvaWireDataWrapper } from '../../../codec/evawire/EvaWireDataWrapper';
import { EvaWireFormat } from '../../../codec/evawire/EvaWireFormat';
import { VoltMessages } from '../../../VoltMessages';
import { WiredContractOpenEvent, WiredContractContentsEvent, WiredContractUpdateResultEvent } from '../../incoming/roomevents';
import { GetWiredContractContentsComposer, UpdateWiredContractComposer } from '../../outgoing/roomevents';
import { IWiredContractContents } from './WiredContractData';
import { WiredContractContentsParser } from './WiredContractContentsParser';
import { WiredContractOpenParser } from './WiredContractOpenParser';
import { WiredContractUpdateResultParser } from './WiredContractUpdateResultParser';

// Independent AIR field fixture, also pinned in Plus WiredNativeContractProtocolTests.
const PAYMENT_HEX = '0000002a00000100000001000000020000000007010000000201000000010001390000010003506179000767656e65726963';
const payment: IWiredContractContents = {
    contractId: 42, contractType: 0,
    definition: { youGiveRule: [{ nodes: [{ type: 0, amount: 7, itemType: null }, { type: 1, amount: 2, itemType: { isWallItem: true, typeId: 1, legacyPosterId: '9' } }] }], youGetRule: null },
    paymentMode: 1, receiveText: 'Pay', layoutType: 'generic', rewardCategory: 11, showDialog: false, rewardText: ''
};
const bytes = (hex: string) => Uint8Array.from(hex.match(/../g), part => parseInt(part, 16)).buffer;
const wrap = (buffer: ArrayBuffer) => new EvaWireDataWrapper(2796, new BinaryReader(buffer));
const encode = (contents: IWiredContractContents) => new EvaWireFormat().encode(2559, new UpdateWiredContractComposer(contents).getMessageArray()).getBuffer().slice(6);
const hex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');

describe('native contract editor AIR protocol', () =>
{
    it('registers all five source-confirmed October12 messages without replacing transaction packets', () =>
    {
        const messages = new VoltMessages();
        expect(messages.events.get(3833)).toBe(WiredContractOpenEvent);
        expect(messages.events.get(2796)).toBe(WiredContractContentsEvent);
        expect(messages.events.get(72)).toBe(WiredContractUpdateResultEvent);
        expect(messages.composers.get(3415)).toBe(GetWiredContractContentsComposer);
        expect(messages.composers.get(2559)).toBe(UpdateWiredContractComposer);
        expect(messages.events.has(84)).toBe(true);
        expect(new GetWiredContractContentsComposer(42).getMessageArray()).toEqual([42]);
    });
    it('writes exact short/byte widths and the poster-bearing furniture tuple', () =>
    {
        expect(hex(encode(payment))).toBe(PAYMENT_HEX);
        const parser = new WiredContractContentsParser();
        const wrapper = wrap(bytes(PAYMENT_HEX));
        expect(parser.parse(wrapper)).toBe(true);
        expect(wrapper.bytesAvailable).toBe(false);
        expect({ ...parser }).toEqual(payment);
    });
    it.each([1, 2] as const)('round-trips kind %i without leaking prior payment options', kind =>
    {
        const contents: IWiredContractContents = { ...payment, contractType: kind,
            definition: { youGiveRule: kind === 1 ? payment.definition.youGiveRule : null, youGetRule: { nodes: [{ type: 0, amount: 11, itemType: null }] } },
            paymentMode: 0, receiveText: '', layoutType: 'generic', rewardCategory: kind === 2 ? 13 : 11,
            showDialog: kind === 2, rewardText: kind === 2 ? 'Thanks ♥' : '' };
        const parser = new WiredContractContentsParser();
        expect(parser.parse(wrap(bytes(PAYMENT_HEX)))).toBe(true);
        expect(parser.parse(wrap(encode(contents)))).toBe(true);
        expect({ ...parser }).toEqual(contents);
    });
    it('preserves absent optional rules and reads the open/result envelopes', () =>
    {
        const contents = { ...payment, paymentMode: 0, definition: { youGiveRule: null, youGetRule: null } };
        const parser = new WiredContractContentsParser();
        expect(parser.parse(wrap(encode(contents)))).toBe(true);
        expect(parser.definition).toEqual(contents.definition);
        const open = new WiredContractOpenParser();
        expect(open.parse(wrap(bytes('0000002a')))).toBe(true);
        expect(open.contractId).toBe(42);
        const writer = new BinaryWriter(); writer.writeInt(42); writer.writeByte(0); writer.writeString('invalid_rules');
        const result = new WiredContractUpdateResultParser();
        expect(result.parse(wrap(writer.getBuffer()))).toBe(true);
        expect([result.contractId, result.isSuccess, result.failCode]).toEqual([42, false, 'invalid_rules']);
    });
    it('rejects invalid counts, node kinds and truncated tuples', () =>
    {
        const fixtures = ['0000002a0000017fffffff', '0000002a0000010000000100000006', '0000002a00000100000001000000010200000007', PAYMENT_HEX.slice(0, 60)];
        for(const fixture of fixtures) expect(new WiredContractContentsParser().parse(wrap(bytes(fixture)))).toBe(false);
    });
});
