/**
 * Plus ids for Habbo features that are teased but not shipped in any Habbo client yet.
 * Replace each value with Habbo's real id once Habbo ships the feature. `IncomingHeader` and
 * `OutgoingHeader` read the packet ids from here, so this is the only place to change.
 */
export class UnreleasedHabboHeaders
{
    /** Server: int targetType, int targetId, int count, count x (string buttonId, string text, boolean enabled). */
    public static readonly WIRED_CONTEXT_MENU = 10300;

    /** Server: int groupId, string groupName, string badgeCode, int roomId. */
    public static readonly GROUP_INVITATION = 10301;

    /** Client: int targetType, int targetId. */
    public static readonly GET_WIRED_CONTEXT_MENU = 10300;

    /** Client: int targetType, int targetId, string buttonId. */
    public static readonly WIRED_CONTEXT_MENU_CLICK = 10301;

    /** Client: int groupId, int answer (0 accept, 1 reject, 2 decide later). */
    public static readonly GROUP_INVITATION_REPLY = 10302;

    /** Wired editor context with the button ids of the room's context menu item add-ons. */
    public static readonly WIRED_EDITOR_CONTEXT_BUTTON_IDS = 900;
}
