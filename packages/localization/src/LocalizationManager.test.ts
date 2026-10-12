import { describe, expect, it } from 'vitest';
import { LocalizationManager } from './LocalizationManager';

const FORUM_DETAILS = 'Score %RATING%, last message by <a href="event:friendbar/user/%LAST_AUTHOR_NAME%">%LAST_AUTHOR_NAME%</a> %UPDATE_TIME%';
const THREAD_DETAILS = 'By <a href="event:friendbar/user/%THREAD_AUTHOR_NAME%">%THREAD_AUTHOR_NAME%</a> %CREATION_TIME%, last message by <a href="event:friendbar/user/%LAST_AUTHOR_NAME%">%LAST_AUTHOR_NAME%</a> %UPDATE_TIME%';

const manager = () =>
{
    const localization = new LocalizationManager();

    localization.setValue('groupforum.view.forum_details', FORUM_DETAILS);
    localization.setValue('groupforum.view.thread_details', THREAD_DETAILS);
    localization.setValue('friendlytime.seconds.ago', '%amount% seconds ago');

    return localization;
};

const createLocalization = () =>
{
    const localization = new LocalizationManager();

    localization.setValue('badge_name_ACH_RoomEntry', 'Room Raider %roman%');
    localization.setValue('badge_desc_ACH_RoomEntry', 'Visit %limit% rooms (level %roman%)');

    return localization;
};

describe('LocalizationManager parameters (AIR Localization.fillParameterValues)', () =>
{
    it('fills every occurrence of a parameter, so a forum without messages reads like AIR', () =>
    {
        const localization = manager();
        const updateTime = localization.getValueWithParameters('friendlytime.seconds.ago', [ 'amount', 'AMOUNT' ], [ '0', '0' ]);

        expect(localization.getValueWithParameters('groupforum.view.forum_details', [ 'RATING', 'LAST_AUTHOR_NAME', 'UPDATE_TIME' ], [ '0', '', updateTime ]))
            .toBe('Score 0, last message by <a href="event:friendbar/user/"></a> 0 seconds ago');
    });

    it('fills both author names of a thread row', () =>
    {
        expect(manager().getValueWithParameters('groupforum.view.thread_details', [ 'THREAD_AUTHOR_NAME', 'CREATION_TIME', 'LAST_AUTHOR_NAME', 'UPDATE_TIME' ], [ 'Ann', '1 day ago', 'Bob', '2 hours ago' ]))
            .toBe('By <a href="event:friendbar/user/Ann">Ann</a> 1 day ago, last message by <a href="event:friendbar/user/Bob">Bob</a> 2 hours ago');
    });

    it('matches the parameter in any letter case and inserts the value literally', () =>
    {
        const localization = manager();

        expect(localization.getValueWithParameters('friendlytime.seconds.ago', [ 'AMOUNT' ], [ '5' ])).toBe('5 seconds ago');
        expect(localization.getValueWithParameter('groupforum.view.forum_details', 'last_author_name', '$&x')).toContain('user/$&x">$&x</a>');
    });

    it('fills registered parameters everywhere too', () =>
    {
        const localization = manager();

        localization.registerParameter('groupforum.view.forum_details', 'LAST_AUTHOR_NAME', 'Cid');

        expect(localization.getValue('groupforum.view.forum_details')).toContain('user/Cid">Cid</a>');
    });
});

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
