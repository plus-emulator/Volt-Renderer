import { describe, expect, it } from 'vitest';
import { SSOTicketMessageComposer } from './SSOTicketMessageComposer';

describe('SSOTicketMessageComposer', () =>
{
    it('sends the ticket and the client time', () =>
    {
        expect(new SSOTicketMessageComposer('sso', 12).getMessageArray()).toEqual([ 'sso', 12 ]);
    });
});
