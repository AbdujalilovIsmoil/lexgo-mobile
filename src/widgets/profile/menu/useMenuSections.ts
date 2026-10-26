import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { CLIENT_SECTIONS } from "./clientItems";
import { COMMON_SECTION } from "./commonItems";
import { PRO_SECTIONS } from "./proItems";
import type { MenuSection } from "./types";

// The menu of the signed-in role; backend flags still decide inside each screen (TZ 3.2).
export function useMenuSections(): MenuSection[] {
  const role = useTabRole();
  return [...(role === "seller" ? PRO_SECTIONS : CLIENT_SECTIONS), COMMON_SECTION];
}
