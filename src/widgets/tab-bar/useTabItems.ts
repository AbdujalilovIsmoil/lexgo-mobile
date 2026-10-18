import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { useRouter } from "expo-router";
import { moduleByKey, useAccess } from "@/entities/access";
import { useIsAuthed } from "@/entities/session";
import { selectHaptic } from "@/shared/lib/haptics";
import { TABS, type TabDef } from "./tabConfig";
import { useTabRole } from "./useTabRole";

export type TabItemData = { def: TabDef; focused: boolean; onPress: () => void };

// Turns the router state into the ordered tab list for the current role.
export function useTabItems({ state, navigation }: Pick<BottomTabBarProps, "state" | "navigation">) {
  const role = useTabRole();
  const access = useAccess();
  const router = useRouter();
  const authed = useIsAuthed();
  const open = (k?: string) => (k ? !!moduleByKey(k)?.visible(access) : false);
  const current = state.routes[state.index]?.name;
  const items: TabItemData[] = TABS[role].flatMap((def) => {
    if ((def.needs && !open(def.needs)) || (def.hideWith && open(def.hideWith))) return [];
    const route = state.routes.find((r) => r.name === def.route);
    if (!route) return [];
    const focused = current === def.route;
    const onPress = () => {
      selectHaptic();
      if (def.auth && !authed) return router.push("/auth/login"); // personal data: a visitor signs in first
      const ev = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!focused && !ev.defaultPrevented) navigation.navigate(route.name);
    };
    return [{ def, focused, onPress }];
  });
  return { items, activeIndex: items.findIndex((i) => i.focused) };
}
