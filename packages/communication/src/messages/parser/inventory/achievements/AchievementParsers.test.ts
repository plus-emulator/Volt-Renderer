import { describe, expect, it } from 'vitest';
import { IBinaryWriter } from '@volt/api';
import { BinaryReader, BinaryWriter } from '@volt/utils';
import { EvaWireDataWrapper } from '../../../../codec/evawire/EvaWireDataWrapper';
import { AchievementData } from './AchievementData';
import { AchievementParser } from './AchievementParser';
import { AchievementsParser } from './AchievementsParser';
import { AchievementsScoreParser } from './AchievementsScoreParser';

const wrapperOf = (header: number, body: IBinaryWriter) => new EvaWireDataWrapper(header, new BinaryReader(body.getBuffer() ?? new ArrayBuffer(0)));

interface AchievementEntry
{
    achievementId: number;
    level: number;
    badgeId: string;
    scoreAtStartOfLevel: number;
    scoreLimit: number;
    rewardAmount: number;
    rewardType: number;
    currentPoints: number;
    finalLevel: boolean;
    category: string;
    subCategory: string;
    levelCount: number;
    displayMethod: number;
    state: number;
}

const entry = (overrides: Partial<AchievementEntry> = {}): AchievementEntry => ({
    achievementId: 2,
    level: 3,
    badgeId: 'ACH_RoomEntry3',
    scoreAtStartOfLevel: 20,
    scoreLimit: 60,
    rewardAmount: 30,
    rewardType: 0,
    currentPoints: 35,
    finalLevel: false,
    category: 'explore',
    subCategory: '',
    levelCount: 10,
    displayMethod: 0,
    state: 1,
    ...overrides
});

// The AIR AchievementData field order: int id, int level, string badge, int scoreAtStartOfLevel, int scoreLimit,
// int rewardAmount, int rewardType, int currentPoints, bool finalLevel, string category, string subCategory,
// int levelCount, int displayMethod, short state.
const writeEntry = (body: IBinaryWriter, value: AchievementEntry): IBinaryWriter =>
{
    body.writeInt(value.achievementId);
    body.writeInt(value.level);
    body.writeString(value.badgeId);
    body.writeInt(value.scoreAtStartOfLevel);
    body.writeInt(value.scoreLimit);
    body.writeInt(value.rewardAmount);
    body.writeInt(value.rewardType);
    body.writeInt(value.currentPoints);
    body.writeByte(value.finalLevel ? 1 : 0);
    body.writeString(value.category);
    body.writeString(value.subCategory);
    body.writeInt(value.levelCount);
    body.writeInt(value.displayMethod);
    body.writeShort(value.state);

    return body;
};

describe('AchievementsParser (1487)', () =>
{
    it('reads the count, every entry with its inline state and the default category', () =>
    {
        const body = new BinaryWriter();
        body.writeInt(3);
        writeEntry(body, entry());
        writeEntry(body, entry({ achievementId: 5, badgeId: 'ACH_Login1', category: 'identity', state: AchievementData.STATE_ARCHIVED }));
        writeEntry(body, entry({ achievementId: 9, badgeId: 'ACH_WF_Points1', category: 'wired_games', state: AchievementData.STATE_CONTROLLED_BY_WIRED }));
        body.writeString('identity');

        const wrapper = wrapperOf(1487, body);
        const parser = new AchievementsParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect(wrapper.bytesAvailable).toBe(false);
        expect(parser.achievements.map(achievement => [ achievement.achievementId, achievement.category, achievement.state ])).toEqual([
            [ 2, 'explore', AchievementData.STATE_ENABLED ],
            [ 5, 'identity', AchievementData.STATE_ARCHIVED ],
            [ 9, 'wired_games', AchievementData.STATE_CONTROLLED_BY_WIRED ]
        ]);
        expect(parser.defaultCategory).toBe('identity');
    });

    it('keeps the record boundary when a state is not the last byte of the frame', () =>
    {
        const body = new BinaryWriter();
        body.writeInt(2);
        writeEntry(body, entry({ state: 3 }));
        writeEntry(body, entry({ achievementId: 7, badgeId: 'ACH_GuideEnrollmentLifetime1', state: 0 }));
        body.writeString('');

        const parser = new AchievementsParser();

        expect(parser.parse(wrapperOf(1487, body))).toBe(true);
        expect(parser.achievements[0].state).toBe(AchievementData.STATE_OFF_SEASON);
        expect(parser.achievements[1].achievementId).toBe(7);
        expect(parser.achievements[1].badgeId).toBe('ACH_GuideEnrollmentLifetime1');
        expect(parser.achievements[1].state).toBe(AchievementData.STATE_DISABLED);
        expect(parser.defaultCategory).toBe('');
    });
});

describe('AchievementParser (1049)', () =>
{
    it('reads one entry including the state short', () =>
    {
        const body = writeEntry(new BinaryWriter(), entry({ achievementId: 11, level: 2, badgeId: 'ACH_Motto2', state: AchievementData.STATE_ARCHIVED }));
        const wrapper = wrapperOf(1049, body);
        const parser = new AchievementParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect(wrapper.bytesAvailable).toBe(false);
        expect(parser.achievement.achievementId).toBe(11);
        expect(parser.achievement.badgeId).toBe('ACH_Motto2');
        expect(parser.achievement.state).toBe(AchievementData.STATE_ARCHIVED);
    });
});

describe('AchievementData', () =>
{
    const parse = (value: AchievementEntry) =>
    {
        const parser = new AchievementParser();

        parser.parse(wrapperOf(1049, writeEntry(new BinaryWriter(), value)));

        return parser.achievement;
    };

    it('exposes progress and limit relative to the start of the level, like the official getters', () =>
    {
        const achievement = parse(entry());

        expect(achievement.scoreAtStartOfLevel).toBe(20);
        expect(achievement.currentPoints).toBe(15);
        expect(achievement.scoreLimit).toBe(40);
        expect(achievement.levelRewardPoints).toBe(30);
        expect(achievement.levelRewardPointType).toBe(0);
        expect(achievement.levelCount).toBe(10);
        expect(achievement.displayMethod).toBe(0);
    });

    it('raises a non-positive score limit to 1 before subtracting the level start', () =>
    {
        const achievement = parse(entry({ scoreAtStartOfLevel: 0, scoreLimit: 0, currentPoints: 0 }));

        expect(achievement.scoreLimit).toBe(1);
    });

    it('fills the level on setMaxProgress', () =>
    {
        const achievement = parse(entry());

        achievement.setMaxProgress();

        expect(achievement.currentPoints).toBe(achievement.scoreLimit);
    });

    it('derives the code by dropping the ACH_ prefix and the level digits', () =>
    {
        expect(parse(entry({ badgeId: 'ACH_RoomEntry3' })).code).toBe('RoomEntry');
        expect(parse(entry({ badgeId: 'ACH_WF_Points12' })).code).toBe('WF_Points');
        expect(parse(entry({ badgeId: 'Login1' })).code).toBe('Login');
    });

    it('counts the first level as achieved past level 1 or on the final level', () =>
    {
        expect(parse(entry({ level: 1, finalLevel: false })).firstLevelAchieved).toBe(false);
        expect(parse(entry({ level: 2, finalLevel: false })).firstLevelAchieved).toBe(true);
        expect(parse(entry({ level: 1, finalLevel: true })).firstLevelAchieved).toBe(true);
    });
});

describe('AchievementsScoreParser (1693)', () =>
{
    it('reads the score int', () =>
    {
        const body = new BinaryWriter();
        body.writeInt(4321);

        const parser = new AchievementsScoreParser();

        expect(parser.parse(wrapperOf(1693, body))).toBe(true);
        expect(parser.score).toBe(4321);
    });
});
