import { describe, expect, it } from 'vitest';
import { BinaryReader, BinaryWriter } from '@volt/utils';
import { EvaWireDataWrapper } from '../../../codec/evawire/EvaWireDataWrapper';
import { AchievementNotificationMessageParser } from './AchievementNotificationMessageParser';

describe('AchievementNotificationMessageParser (2028)', () =>
{
    it('reads the fourteen AchievementUnlocked fields in the official order', () =>
    {
        const body = new BinaryWriter();
        body.writeInt(1);
        body.writeInt(4);
        body.writeInt(318);
        body.writeString('ACH_RoomEntry4');
        body.writeInt(50);
        body.writeInt(40);
        body.writeInt(5);
        body.writeInt(10);
        body.writeInt(2);
        body.writeString('ACH_RoomEntry3');
        body.writeString('explore');
        body.writeByte(1);
        body.writeInt(1234);
        body.writeInt(3);

        const wrapper = new EvaWireDataWrapper(2028, new BinaryReader(body.getBuffer()));
        const parser = new AchievementNotificationMessageParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect(wrapper.bytesAvailable).toBe(false);

        const data = parser.data;

        expect(data.type).toBe(1);
        expect(data.level).toBe(4);
        expect(data.badgeId).toBe(318);
        expect(data.badgeCode).toBe('ACH_RoomEntry4');
        expect(data.points).toBe(50);
        expect(data.levelRewardPoints).toBe(40);
        expect(data.levelRewardPointType).toBe(5);
        expect(data.bonusPoints).toBe(10);
        expect(data.achievementID).toBe(2);
        expect(data.removedBadgeCode).toBe('ACH_RoomEntry3');
        expect(data.category).toBe('explore');
        expect(data.showDialogToUser).toBe(true);
        expect(data.ownerCount).toBe(1234);
        expect(data.badgeRarityId).toBe(3);
    });
});
