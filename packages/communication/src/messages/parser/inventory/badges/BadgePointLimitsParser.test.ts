import { describe, expect, it } from 'vitest';
import { BinaryReader, BinaryWriter } from '@volt/utils';
import { EvaWireDataWrapper } from '../../../../codec/evawire/EvaWireDataWrapper';
import { BadgePointLimitsParser } from './BadgePointLimitsParser';

describe('BadgePointLimitsParser (1231)', () =>
{
    it('expands every code and level into an ACH_ badge id with its limit', () =>
    {
        const body = new BinaryWriter();
        body.writeInt(2);
        body.writeString('RoomEntry');
        body.writeInt(2);
        body.writeInt(1);
        body.writeInt(5);
        body.writeInt(2);
        body.writeInt(20);
        body.writeString('Login');
        body.writeInt(1);
        body.writeInt(1);
        body.writeInt(3);

        const wrapper = new EvaWireDataWrapper(1231, new BinaryReader(body.getBuffer()));
        const parser = new BadgePointLimitsParser();

        parser.flush();

        expect(parser.parse(wrapper)).toBe(true);
        expect(wrapper.bytesAvailable).toBe(false);
        expect(parser.data.map(limit => [ limit.badgeId, limit.limit ])).toEqual([
            [ 'ACH_RoomEntry1', 5 ],
            [ 'ACH_RoomEntry2', 20 ],
            [ 'ACH_Login1', 3 ]
        ]);
    });
});
