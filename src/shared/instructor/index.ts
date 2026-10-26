// Assistant target registry (TZ 9). Screens put elements on the assistant's map; the AI Instructor
// finds them by id to scroll / highlight / open / pre-fill. Documented in tz-status/AI.md.
export { useInstructorTarget, useGlobalTarget } from "./useInstructorTarget";
export { scrollToTarget } from "./scroller";
export { useInstructorModal, useInstructorPrefill, registerModal, registerPrefill, openRegisteredModal, findPrefill } from "./controls";
export { registerTarget, findTarget, allTargets, subscribeTargets, targetsVersion } from "./registry";
export { setTargetAliases, canonicalId, sameTarget } from "./aliases";
export { usePathStore, currentPath, screenId } from "./pathStore";
export { visibleTargets, targetDecls } from "./visible";
export { measureNode, inWindow } from "./measure";
export { mobileRoute, hrefAllowed, normalizeHref } from "./routes";
export { AI_IDS } from "./ids";
export type { Rect, TargetEntry, TargetDecl, VisibleTarget } from "./types";
