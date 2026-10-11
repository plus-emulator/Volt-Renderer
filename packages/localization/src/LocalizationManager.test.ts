import { describe, expect, it } from 'vitest';
import { LocalizationManager } from './LocalizationManager';

const createLocalization = () =>
{
    const localization = new LocalizationManager();

    localization.setValue('badge_name_ACH_RoomEntry', 'Room Raider %roman%');
    localization.setValue('badge_desc_ACH_RoomEntry', 'Visit %limit% rooms (level %roman%)');

    return localization;
};

describe('LocalizationManager achievement badges', () =>
{
    it('fills %roman% from the badge level', () =>
    {
        expect(createLocalization().getBadgeName('ACH_RoomEntry3')).toBe('Room Raider III');
    });

    it('fills %limit% from the badge point limit of the exact badge id', () =>
    {
        const localization = createLocalization();

        localization.setBadgePointLimit('ACH_RoomEntry3', 20);

        expect(localization.getBadgeDesc('ACH_RoomEntry3')).toBe('Visit 20 rooms (level III)');
    });

    it('fills a missing badge point limit with 0 like the official int lookup', () =>
    {
        expect(createLocalization().getBadgeDesc('ACH_RoomEntry4')).toBe('Visit 0 rooms (level IV)');
    });

    it('returns an empty text for a badge without localization', () =>
    {
        const localization = createLocalization();

        expect(localization.getBadgeName('ACH_Unknown1')).toBe('');
        expect(localization.getBadgeDesc('ACH_Unknown1')).toBe('');
    });
});
