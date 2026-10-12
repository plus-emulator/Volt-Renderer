import { describe, expect, it } from 'vitest';
import { UpdateThreadMessageComposer } from './UpdateThreadMessageComposer';

describe('UpdateThreadMessageComposer', () =>
{
    it('sends the sticky flag before the locked flag, like AIR UpdateThread (class_3777)', () =>
    {
        expect(new UpdateThreadMessageComposer(7, 12, true, false).getMessageArray()).toEqual([7, 12, false, true]);
        expect(new UpdateThreadMessageComposer(7, 12, false, true).getMessageArray()).toEqual([7, 12, true, false]);
    });
});
