import type { LinkInput } from "@/shared/links";
import type { Notification } from "./types";

// What the deep-link resolver needs from a folded notification (TZ 28 payload fields + staging data).
export const linkInputOf = (n: Notification): LinkInput => ({ event: n.event, category: n.category, entityType: n.entityType, entityId: n.entityId, deepLink: n.deepLink, data: n.data });
