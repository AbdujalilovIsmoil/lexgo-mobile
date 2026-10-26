import type { User } from "@/entities/session";

// What the signed-in user may open. The mobile app serves a visitor, a client and the two professionals (advokat, yurist); the
// backend's permission codes only add a section on top (e.g. `tasks.view` opens the team's task list).
export type Access = {
  seller: boolean; // advokat or yurist
  canCalls: boolean; // may start calls and meetings (meetings.manage: the professionals hold it)
  perms: string[];
  /** One permission code, or a list where any is enough. */
  can: (perm: string | readonly string[]) => boolean;
};

export function buildAccess(user: User | null | undefined): Access {
  const perms = user?.permissions ?? [];
  return {
    seller: user?.role === "lawyer" || user?.role === "advocate",
    canCalls: perms.includes("meetings.manage"),
    perms,
    can: (perm) => (typeof perm === "string" ? [perm] : perm).some((p) => perms.includes(p)),
  };
}
