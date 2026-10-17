import { IMessageDataWrapper } from '@volt/api';
import { describe, expect, it } from 'vitest';
import { AuthenticatedParser } from './AuthenticatedParser';

describe('AuthenticatedParser', () =>
{
    it('reads the account id, suggested login actions and identity id', () =>
    {
        const values: number[] = [ 7, 2, 3, 4, 9 ];
        const wrapper = {
            readInt: () => values.shift(),
            readShort: () => values.shift()
        } as unknown as IMessageDataWrapper;
        const parser = new AuthenticatedParser();

        expect(parser.parse(wrapper)).toBe(true);
        expect(parser.accountId).toBe(7);
        expect(parser.suggestedLoginActions).toEqual([ 3, 4 ]);
        expect(parser.identityId).toBe(9);
    });
});
