import { useUnreadCount } from "@/entities/notification";
import { useBadge } from "@/shared/lib";
import { MenuSectionCard } from "./menu/MenuSectionCard";
import { useMenuSections } from "./menu/useMenuSections";

// Role-specific account menu: every screen the role may open that has no tab of its own.
export function ProfileMenu() {
  const sections = useMenuSections();
  const badges = { notifications: useUnreadCount(), support: useBadge("support") };
  return (
    <>
      {sections.map((sec) => (
        <MenuSectionCard key={sec.key} section={sec} badges={badges} />
      ))}
    </>
  );
}
