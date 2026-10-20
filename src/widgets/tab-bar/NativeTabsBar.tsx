import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useRouter } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { useBadgeStore } from "@/shared/lib/badgeStore";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { TABS } from "./tabConfig";
import { useTabRole } from "./useTabRole";
import { useVisibleTabs } from "./useTabItems";

// Feather names of tabConfig → SF Symbols of the system tab bar.
const SF: Record<string, string> = {
  home: "house.fill", grid: "square.grid.2x2.fill", zap: "sparkles", briefcase: "briefcase.fill", "message-circle": "message.fill",
  layers: "square.stack.3d.up.fill", inbox: "tray.fill", users: "person.2.fill", "trending-up": "chart.line.uptrend.xyaxis",
  headphones: "headphones", video: "video.fill", "bar-chart-2": "chart.bar.fill", sliders: "slider.horizontal.3", bell: "bell.fill", user: "person.fill",
};

// The AI tab: a glass pearl (clear bead, prismatic rim) that lights up with the brand gradient while the tab is open.
const AI_PEARL = { default: require("../../../assets/tabs/ai-glass.png"), selected: require("../../../assets/tabs/ai-glass-on.png") };

// The system tab bar (UITabBar): Liquid Glass on iOS 26 with no custom drawing. Every route is declared, in the role's order first;
// the ones outside the role or not allowed right now are hidden. `bar` is false on screens that ask for no bar (the AI chat).
export function NativeTabsBar({ bar }: { bar: boolean }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const authed = useIsAuthed();
  const role = useTabRole();
  const badges = useBadgeStore((s) => s.badges);
  const shown = useVisibleTabs();
  const rest = [...new Set(Object.values(TABS).flat().map((d) => d.route))].filter((r) => !shown.some((d) => d.route === r));
  return (
    <NativeTabs hidden={!bar} tintColor={c.accent}>
      {shown.map((def) => {
        const n = def.badge ? (badges[def.badge] ?? 0) : 0;
        const guard = def.auth && !authed;
        // the AI pearl is large enough to stand without its caption (`Label hidden`)
        return (
          <NativeTabs.Trigger
            key={`${role}-${def.route}`}
            name={def.route}
            disabled={guard} // a visitor's tap on a personal tab never switches it: the (still emitted) press sends them to sign in
            listeners={guard ? { tabPress: () => router.push("/auth/login") } : undefined}
          >
            {def.center ? <NativeTabs.Trigger.Icon src={AI_PEARL} renderingMode="original" /> : <NativeTabs.Trigger.Icon sf={SF[def.icon] as never} />}
            <NativeTabs.Trigger.Label hidden={def.center}>{t(def.labelKey)}</NativeTabs.Trigger.Label>
            {n ? <NativeTabs.Trigger.Badge>{n > 99 ? "99+" : String(n)}</NativeTabs.Trigger.Badge> : null}
          </NativeTabs.Trigger>
        );
      })}
      {rest.map((name) => <NativeTabs.Trigger key={`hidden-${name}`} name={name} hidden />)}
    </NativeTabs>
  );
}
