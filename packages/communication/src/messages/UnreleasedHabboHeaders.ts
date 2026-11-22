/**
 * Plus ids for Habbo features that are teased but not shipped in any Habbo client yet.
 * Replace each value with Habbo's real id once Habbo ships the feature. `IncomingHeader` and
 * `OutgoingHeader` read the packet ids from here, so this is the only place to change.
 */
export class UnreleasedHabboHeaders
{
    /** Server: int groupId, string groupName, string badgeCode, int roomId. */
    public static readonly GROUP_INVITATION = 10301;

    /** Client: int groupId, int answer (0 accept, 1 reject, 2 decide later). */
    public static readonly GROUP_INVITATION_REPLY = 10302;
}
