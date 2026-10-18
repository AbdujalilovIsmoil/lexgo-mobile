import { useAccess } from "@/entities/access";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { CLIENT_SECTIONS } from "./clientItems";
import { ORG_SECTION, POOL_ITEM, PRO_SECTIONS } from "./proItems";
import { CC_SECTIONS, COMMON_SECTION, STAFF_SECTIONS } from "./staffItems";
import type { MenuSection } from "./types";

// The menu of the signed-in role; backend flags still decide inside each screen (TZ 3.2).
export function useMenuSections(): MenuSection[] {
  const role = useTabRole();
  const a = useAccess();
  const base = role === "seller" ? PRO_SECTIONS : role === "callcenter" ? CC_SECTIONS : role === "staff" ? STAFF_SECTIONS : CLIENT_SECTIONS;
  const extra: MenuSection[] = [];
  if (role === "seller" && a.orgOwner) extra.push(ORG_SECTION);
  if (role === "seller" && a.callCenterLawyer) extra.push({ key: "pool", items: [POOL_ITEM] });
  if (role !== "seller" && role !== "staff" && a.staff) extra.push(...STAFF_SECTIONS);
  return [...base, ...extra, COMMON_SECTION];
}
