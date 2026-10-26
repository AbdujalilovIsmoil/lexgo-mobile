import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useTablet } from "@/shared/lib/useTablet";
import { useSidebar } from "./sidebarStore";
import { useSidebarHidden } from "./useSidebarHidden";

// The menu button at the left end of every page header row (tab pages and the home heroes): it opens the drawer. It replaced the tab on
// the screen's left edge, which lay over the page and opened the drawer when a card under it was tapped. A wide tablet keeps its sidebar
// docked beside the page, so no button there.
export function MenuButton({ glass }: { glass?: boolean }) {
  const { t } = useT();
  const hidden = useSidebarHidden();
  const { docked } = useTablet();
  const show = useSidebar((s) => s.show);
  if (hidden || docked) return null;
  return <IconButton icon="menu" size={40} tone={glass ? "glass" : "tint"} label={t("ntd.sbOpen")} onPress={show} />;
}
