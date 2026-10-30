import { memo, useEffect, useState } from "react";
import { DynamicColorIOS, Platform, useWindowDimensions, View } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useRouter } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { loadGlass } from "@/shared/lib/glass";
import { useTablet } from "@/shared/lib/useTablet";
import { useBadgeStore } from "@/shared/lib/badgeStore";
import { useT } from "@/shared/i18n";
import { AURORA } from "@/shared/theme";
import { useAuroraStyle } from "@/shared/ui";
import { AiRaisedButton } from "./AiRaisedButton";
import { CaptionMeter, ReturnWatcher } from "./BarHelpers";
import { AI_SLOT as AI_WIDTH, GAP_SLOT, ITEM_MIN, ITEM_PAD, captionFit, shortCaption, slotShift } from "./captionFit";
import { installTabReach, setBarRoutes } from "./tabReach";
import { TABS, type TabDef } from "./tabConfig";
import { useTabRole } from "./useTabRole";
import { useVisibleTabs } from "./useTabItems";
import { useBarImages } from "./useBarImages";

// Feather names of tabConfig → SF Symbols of the system tab bar: the outline at rest, the filled one when selected.
const SF: Record<string, string> = {
  home: "house", "file-text": "doc.text", grid: "square.grid.2x2", zap: "sparkles", briefcase: "briefcase", "message-circle": "message",
  layers: "square.stack.3d.up", inbox: "tray", users: "person.2",
};
const sfIcon = (icon: string) => ({ default: SF[icon], selected: `${SF[icon]}.fill` }) as never;
// The selected tab in ink (white in the dark), as the design has it; Liquid Glass picks the rest of the colours itself.
// Only on iOS: this module is imported by the tabs layout on Android too, where DynamicColorIOS throws.
const INK = Platform.OS === "ios" ? DynamicColorIOS({ light: "#0A1526", dark: "#FFFFFF" }) : "#0A1526";

installTabReach();

// The AI tab's slot in the system bar is left empty (a clear 8 pt image, no caption): AiRaisedButton stands in it, rising above the bar.
// The slot must stay narrow: the bar sizes its items by content, and a wide slot squeezes the neighbours' captions into "Xiz…".
const GAP: TabDef = { route: "gap", icon: "home", labelKey: "" };
const AI_SLOT = require("../../../assets/tabs/ai-slot.png");
const GLASS = !!loadGlass(); // iOS 26 sizes the items by their captions; the classic bar (iOS 18 and older) gives every item the same width

// The system tab bar (UITabBar): Liquid Glass on iOS 26 with no custom drawing. Every route is declared, in the role's order first;
// the ones outside the role or not allowed right now are hidden. `bar` is false on screens that ask for no bar (the AI chat).
export const NativeTabsBar = memo(function NativeTabsBar({ bar }: { bar: boolean }) {
  const { t } = useT();
  const router = useRouter();
  const authed = useIsAuthed();
  const role = useTabRole();
  const { tablet } = useTablet(); // a tablet has the sidebar instead of a tab bar (no bar on top, none at the bottom): only the AI button stays
  const badges = useBadgeStore((s) => s.badges);
  // The AI tab always takes the middle slot, so the raised button sits at the exact centre of the bar: with an even number of tabs an
  // empty disabled slot (`gap`) beside it makes the count odd.
  const visible = useVisibleTabs();
  const shown = (() => {
    const ai = visible.find((d) => d.center);
    if (!ai) return visible;
    const others = visible.filter((d) => d !== ai);
    const left = Math.floor(visible.length / 2);
    const row = [...others.slice(0, left), ai, ...others.slice(left)];
    return visible.length % 2 === 0 ? [...row.slice(0, left + 1), GAP, ...row.slice(left + 1)] : row;
  })();
  const images = useBarImages(shown.filter((d) => !d.center && d.route !== GAP.route).map((d) => d.icon));
  const centerAt = shown.findIndex((d) => d.center);
  const barKey = shown.map((d) => d.route).join(",");
  useEffect(() => { setBarRoutes(barKey ? barKey.split(",") : []); }, [barKey]); // links to any other tab page open it as a stack screen
  const aurora = useAuroraStyle(); // every tab page sits on the aurora (the pages themselves are transparent)
  const rest = [...new Set(Object.values(TABS).flat().map((d) => d.route))].filter((r) => !shown.some((d) => d.route === r));
  // Captions that fit: the bar cuts a caption it has no room for to "Xab…", so their real widths (measured at 10 pt by the hidden texts below)
  // pick the size; if that is unreadably small the first word of each is used, and if even that does not fit, no captions.
  const { width } = useWindowDimensions();
  const [measured, setMeasured] = useState<Record<string, number>>({});
  const fulls = shown.filter((d) => !d.center && d.route !== GAP.route).map((d) => t(d.labelKey));
  const shorts = fulls.map(shortCaption);
  const w10 = (x: string) => measured[x] ?? x.length * 5.8;
  const extra = (shown.some((d) => d.center) ? AI_WIDTH : 0) + (shown.some((d) => d.route === GAP.route) ? GAP_SLOT : 0);
  const fit = captionFit(width, fulls.map(w10), shorts.map(w10), extra);
  const [nudge, setNudge] = useState(0); // see ReturnWatcher
  const caption = (x: string) => (fit.mode === "short" ? shortCaption(x) : x);
  // The raised button stands over the AI slot, which is off the screen centre when the captions on its two sides differ in width
  // ("Bosh sahifa" + "Hujjatlar" vs "Ishlar" + "Xabarlar"); shorter captions on a narrow phone move it back towards the centre.
  const itemW = (d: TabDef) => (d.route === GAP.route ? GAP_SLOT : Math.max(ITEM_MIN, fit.mode === "hidden" ? 0 : (w10(caption(t(d.labelKey))) * fit.size) / 10) + ITEM_PAD);
  const shift = GLASS && centerAt >= 0 ? slotShift(shown.slice(0, centerAt).map(itemW), shown.slice(centerAt + 1).map(itemW)) : 0;
  return (
    <View style={{ flex: 1 }}>
    <CaptionMeter texts={[...new Set([...fulls, ...shorts])]} onWidths={(w) => setMeasured((m) => ({ ...m, ...w }))} />
    <ReturnWatcher onSettled={() => setNudge((n) => n + 1)} />
    <NativeTabs hidden={!bar || tablet} tintColor={INK} labelStyle={{ fontSize: fit.size + (nudge % 2) * 0.01 }}>
      {shown.map((def) => {
        const n = def.badge ? (badges[def.badge] ?? 0) : 0;
        const guard = (def.auth && !authed) || def.route === GAP.route;
        return (
          <NativeTabs.Trigger
            key={`${role}-${def.route}`}
            name={def.route}
            contentStyle={AURORA ? aurora : undefined}
            disableAutomaticContentInsets
            disabled={guard} // a visitor's tap on a personal tab never switches it: the (still emitted) press sends them to sign in
            listeners={guard && def.route !== GAP.route ? { tabPress: () => router.push("/auth/login") } : undefined}
          >
            {def.center || def.route === GAP.route ? <NativeTabs.Trigger.Icon src={AI_SLOT} renderingMode="original" /> : images?.[def.icon] ? <NativeTabs.Trigger.Icon src={images[def.icon] as never} renderingMode="template" /> : <NativeTabs.Trigger.Icon sf={sfIcon(def.icon)} />}
            <NativeTabs.Trigger.Label hidden={def.route === GAP.route || fit.mode === "hidden"}>{caption(t(def.labelKey))}</NativeTabs.Trigger.Label>
            {n ? <NativeTabs.Trigger.Badge>{n > 99 ? "99+" : String(n)}</NativeTabs.Trigger.Badge> : null}
          </NativeTabs.Trigger>
        );
      })}
      {rest.map((name) => <NativeTabs.Trigger key={`hidden-${name}`} name={name} contentStyle={AURORA ? aurora : undefined} hidden />)}
    </NativeTabs>
    {centerAt >= 0 ? <AiRaisedButton labelKey={shown[centerAt].labelKey} hidden={!bar} shift={shift} /> : null}
    </View>
  );
});
