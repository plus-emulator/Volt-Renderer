import { BinaryReader, BinaryWriter } from '@volt/utils';
import { describe, expect, it } from 'vitest';
import { EvaWireDataWrapper } from '../../../codec/evawire/EvaWireDataWrapper';
import { WiredEnvironmentParser } from '../roomevents/WiredEnvironmentParser';
import { WiredPermissionsParser } from '../roomevents/WiredPermissionsParser';
import { RoomEnterParser } from './access/RoomEnterParser';
import { RoomRightsOwnerParser } from './access/rights/RoomRightsOwnerParser';
import { RoomUnitInfoParser } from './unit/RoomUnitInfoParser';
import { RoomUnitParser } from './unit/RoomUnitParser';

type Field = [ 'int' | 'short' | 'bool' | 'string', number | boolean | string ];

const wrapperOf = (fields: Field[]) =>
{
    const writer = new BinaryWriter();

    for(const [ type, value ] of fields)
    {
        if(type === 'int') writer.writeInt(value as number);
        else if(type === 'short') writer.writeShort(value as number);
        else if(type === 'bool') writer.writeByte(value ? 1 : 0);
        else writer.writeString(value as string);
    }

    return new EvaWireDataWrapper(0, new BinaryReader(writer.getBuffer()));
};

const common = (id: number, name: string, index: number, type: number): Field[] => [
    [ 'int', id ], [ 'string', name ], [ 'string', 'motto' ], [ 'string', 'hd-180-1' ], [ 'int', index ],
    [ 'int', 2 ], [ 'int', 3 ], [ 'string', '1.5' ], [ 'int', 4 ], [ 'int', type ]
];

describe('room entry parsers (AIR WIN63-202610131318-860371703)', () =>
{
    it('OpenConnection reads the flat id', () =>
    {
        const wrapper = wrapperOf([ [ 'int', 4521 ] ]);
        const parser = new RoomEnterParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect(parser.roomId).toBe(4521);
        expect(wrapper.bytesAvailable).toBe(false);
    });

    it('YouAreOwner reads the flat id', () =>
    {
        const wrapper = wrapperOf([ [ 'int', 4521 ] ]);
        const parser = new RoomRightsOwnerParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect(parser.roomId).toBe(4521);
        expect(wrapper.bytesAvailable).toBe(false);
    });

    it('WiredEnvironment ends at the enabled achievements', () =>
    {
        const wrapper = wrapperOf([ [ 'bool', true ], [ 'int', 1 ], [ 'string', 'ACH_RoomEntry' ] ]);
        const parser = new WiredEnvironmentParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect(parser.hasClickUserWired).toBe(true);
        expect(parser.enabledAchievements).toEqual([ 'ACH_RoomEntry' ]);
        expect(wrapper.bytesAvailable).toBe(false);
    });

    it('WiredPermissions reads canModify then canRead and ends there', () =>
    {
        const wrapper = wrapperOf([ [ 'bool', true ], [ 'bool', false ] ]);
        const parser = new WiredPermissionsParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect([ parser.canModify, parser.canRead ]).toEqual([ true, false ]);
        expect(wrapper.bytesAvailable).toBe(false);
    });

    it('UserChange reads through to the badges rank', () =>
    {
        const wrapper = wrapperOf([
            [ 'int', -1 ], [ 'string', 'hd-180-1' ], [ 'string', 'm' ], [ 'string', 'hi' ], [ 'int', 12 ],
            [ 'string', '' ], [ 'int', 1 ], [ 'int', 1 ], [ 'int', 2 ], [ 'int', 3 ], [ 'int', 8 ]
        ]);
        const parser = new RoomUnitInfoParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect([ parser.unitId, parser.figure, parser.gender, parser.motto, parser.achievementScore, parser.badgesRank ])
            .toEqual([ -1, 'hd-180-1', 'M', 'hi', 12, 8 ]);
        expect(wrapper.bytesAvailable).toBe(false);
    });

    it('Users reads each user type with nothing after its branch', () =>
    {
        const wrapper = wrapperOf([
            [ 'int', 3 ],
            ...common(7, 'Dennis', 1, 1),
            [ 'string', 'm' ], [ 'int', 9 ], [ 'int', 0 ], [ 'string', 'Club' ], [ 'string', '' ], [ 'int', 12 ],
            [ 'bool', false ], [ 'int', 5 ],
            ...common(10, 'Rex', 2, 2),
            [ 'int', 13 ], [ 'int', 7 ], [ 'string', 'Dennis' ], [ 'int', 1 ], [ 'bool', true ], [ 'bool', false ],
            [ 'bool', false ], [ 'bool', false ], [ 'bool', false ], [ 'bool', false ], [ 'int', 6 ], [ 'string', '' ],
            ...common(11, 'Frank', 3, 4),
            [ 'string', 'f' ], [ 'int', 7 ], [ 'string', 'Dennis' ], [ 'int', 2 ], [ 'short', 1 ], [ 'short', 2 ]
        ]);
        const parser = new RoomUnitParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect(wrapper.bytesAvailable).toBe(false);

        const [ habbo, pet, bot ] = parser.users;

        expect([ habbo.webID, habbo.groupName, habbo.activityPoints, habbo.badgesRank ]).toEqual([ 7, 'Club', 12, 5 ]);
        expect([ pet.webID, pet.hasSaddle, pet.petLevel ]).toEqual([ 10, true, 6 ]);
        expect([ bot.webID, bot.sex, bot.ownerName, bot.botSkills ]).toEqual([ 11, 'F', 'Dennis', [ 1, 2 ] ]);
    });
});
