import { useAccess } from "@/entities/access";
import { isRouteMissing } from "../api/errors";
import { useRegistry } from "./queries";
import { STUDIO_ROLES } from "./types";

export type StudioNeed = "any" | "edit" | "review" | "publish" | "admin";
const FULL = ["admin", "superadmin", "studio_admin"];

// Studio roles come from GET /studio/constructors (userRoles) plus the session roles —
// admin, superadmin and studio_admin may do everything (lib/services/studio.ts useStudioAccess).
export function useStudioAccess() {
  const sess = useAccess().roles;
  const q = useRegistry();
  const set = new Set([...(q.data?.userRoles ?? []), ...sess]);
  const has = (list: string[]) => list.some((r) => set.has(r));
  const isAdmin = has(FULL);
  const canPublish = has([...FULL, "studio_publisher"]);
  return {
    avail: q.isLoading ? ("checking" as const) : isRouteMissing(q.error) ? ("off" as const) : ("on" as const),
    constructors: q.data?.items ?? [],
    any: isAdmin || [...set].some((r) => (STUDIO_ROLES as readonly string[]).includes(r)),
    isAdmin,
    canEdit: has([...FULL, "studio_editor"]),
    canReview: has([...FULL, "studio_reviewer", "studio_publisher"]),
    canPublish,
    canArchive: canPublish,
    roles: [...set],
    error: q.error,
    reload: () => void q.refetch(),
  };
}
export type StudioAccess = ReturnType<typeof useStudioAccess>;

export const studioAllowed = (a: StudioAccess, need: StudioNeed): boolean =>
  need === "any" ? a.any : need === "edit" ? a.canEdit : need === "review" ? a.canReview : need === "publish" ? a.canPublish : a.isAdmin;
