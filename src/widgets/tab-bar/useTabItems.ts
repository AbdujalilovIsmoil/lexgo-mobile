import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { useRouter } from "expo-router";
import { moduleByKey, useAccess } from "@/entities/access";
import { useCabinet } from "@/entities/pro-workspace";
import { useIsAuthed, useSession } from "@/entities/session";
import { selectHaptic } from "@/shared/lib/haptics";
import { sellerTabHidden, TABS, type TabDef } from "./tabConfig";
import { useTabRole } from "./useTabRole";

export type TabItemData = { def: TabDef; focused: boolean; onPress: () => void };

// The tabs of the current role that may be shown right now (module access, a pending seller, the cabinet's actions).
export function useVisibleTabs(): TabDef[] {
  const role = useTabRole();
  const access = useAccess();
  const open = (k?: string) => (k ? !!moduleByKey(k)?.visible(access) : false);
  const cabinet = useCabinet().data; // professionals only (the query is off for everyone else)
  const pending = useSession()?.user.accountStatus === "pending";
  const limited = role === "seller" && (cabinet ? cabinet.limited : pending);
  return TABS[role].filter((def) => {
    if ((def.needs && !open(def.needs)) || (def.hideWith && open(def.hideWith))) return false;
    return !(role === "seller" && sellerTabHidden(def.route, limited, cabinet?.actions));
  });
}

// Turns the router state into the ordered tab list for the current role.
export function useTabItems({ state, navigation }: Pick<BottomTabBarProps, "state" | "navigation">) {
  const router = useRouter();
  const authed = useIsAuthed();
  const defs = useVisibleTabs();
  const current = state.routes[state.index]?.name;
  const items: TabItemData[] = defs.flatMap((def) => {
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
