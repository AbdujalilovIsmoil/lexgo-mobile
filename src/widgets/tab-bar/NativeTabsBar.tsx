import { useEffect } from "react";
import { View } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useRouter } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { useBadgeStore } from "@/shared/lib/badgeStore";
import { useT } from "@/shared/i18n";
import { AURORA, useColors } from "@/shared/theme";
import { useAuroraStyle } from "@/shared/ui";
import { AiRaisedButton } from "./AiRaisedButton";
import { installTabReach, setBarRoutes } from "./tabReach";
import { TABS } from "./tabConfig";
import { useTabRole } from "./useTabRole";
import { useVisibleTabs } from "./useTabItems";

// Feather names of tabConfig → SF Symbols of the system tab bar.
const SF: Record<string, string> = {
  home: "house.fill", grid: "square.grid.2x2.fill", zap: "sparkles", briefcase: "briefcase.fill", "message-circle": "message.fill",
  layers: "square.stack.3d.up.fill", inbox: "tray.fill", users: "person.2.fill", "trending-up": "chart.line.uptrend.xyaxis",
  headphones: "headphones", video: "video.fill", "bar-chart-2": "chart.bar.fill", sliders: "slider.horizontal.3", bell: "bell.fill", user: "person.fill",
};

installTabReach();

// The AI tab's slot in the system bar is left empty (a clear image, no caption): AiRaisedButton stands in it, rising above the bar.
const AI_SLOT = require("../../../assets/tabs/ai-slot.png");

// The system tab bar (UITabBar): Liquid Glass on iOS 26 with no custom drawing. Every route is declared, in the role's order first;
// the ones outside the role or not allowed right now are hidden. `bar` is false on screens that ask for no bar (the AI chat).
export function NativeTabsBar({ bar }: { bar: boolean }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const authed = useIsAuthed();
  const role = useTabRole();
  const badges = useBadgeStore((s) => s.badges);
  // With an odd number of tabs the AI tab takes the middle slot, so the raised button sits at the exact centre of the bar.
  const visible = useVisibleTabs();
  const shown = (() => {
    const ai = visible.find((d) => d.center);
    if (!ai || visible.length % 2 === 0) return visible;
    const rest = visible.filter((d) => d !== ai);
    rest.splice(Math.floor(visible.length / 2), 0, ai);
    return rest;
  })();
  const centerAt = shown.findIndex((d) => d.center);
  const barKey = shown.map((d) => d.route).join(",");
  useEffect(() => { setBarRoutes(barKey ? barKey.split(",") : []); }, [barKey]); // links to any other tab page open it as a stack screen
  const aurora = useAuroraStyle(); // every tab page sits on the aurora (the pages themselves are transparent)
  const rest = [...new Set(Object.values(TABS).flat().map((d) => d.route))].filter((r) => !shown.some((d) => d.route === r));
  return (
    <View style={{ flex: 1 }}>
    <NativeTabs hidden={!bar} tintColor={c.accent}>
      {shown.map((def) => {
        const n = def.badge ? (badges[def.badge] ?? 0) : 0;
        const guard = def.auth && !authed;
        return (
          <NativeTabs.Trigger
            key={`${role}-${def.route}`}
            name={def.route}
            contentStyle={AURORA ? aurora : undefined}
            disableAutomaticContentInsets
            disabled={guard} // a visitor's tap on a personal tab never switches it: the (still emitted) press sends them to sign in
            listeners={guard ? { tabPress: () => router.push("/auth/login") } : undefined}
          >
            {def.center ? <NativeTabs.Trigger.Icon src={AI_SLOT} renderingMode="original" /> : <NativeTabs.Trigger.Icon sf={SF[def.icon] as never} />}
            <NativeTabs.Trigger.Label hidden={def.center}>{t(def.labelKey)}</NativeTabs.Trigger.Label>
            {n ? <NativeTabs.Trigger.Badge>{n > 99 ? "99+" : String(n)}</NativeTabs.Trigger.Badge> : null}
          </NativeTabs.Trigger>
        );
      })}
      {rest.map((name) => <NativeTabs.Trigger key={`hidden-${name}`} name={name} contentStyle={AURORA ? aurora : undefined} hidden />)}
    </NativeTabs>
    {bar && centerAt >= 0 ? <AiRaisedButton index={centerAt} count={shown.length} labelKey={shown[centerAt].labelKey} /> : null}
    </View>
  );
}
