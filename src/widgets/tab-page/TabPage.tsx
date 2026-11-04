import { useMemo, useState, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useTabBarHidden } from "@/shared/lib/tabBarHidden";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { HeaderExtra } from "@/shared/ui/headerExtra";
import { TabHeaderProvider } from "./tabScroll";
import { TopBar } from "./TopBar";
import { NavyBar } from "./NavyBar";

// `navy`: a professional's tab — the compact navy bar of the workspace on top instead of the light greeting row. Like on the workspace
// (Ish maydoni) the bar carries the page's name and stays pinned while the page scrolls; below it only the page's line (subtitle) — the
// big title under an empty bar left the top of So'rovlar / Mijozlar / Xabarlar looking blank.
type Props = { title: string; subtitle?: string; right?: ReactNode; noActions?: boolean; navy?: boolean; children: ReactNode };

// Frame of a bottom-tab page. A client's header is the Home row (logo, greeting, name, tools, support, bell, avatar), then the big
// title with its text, then the banner; a professional's (`navy`) is the pinned navy bar with the page's name, then the text and the
// banner. The rest is not pinned: a list inside puts `useTabHeader()` in its ListHeaderComponent so it scrolls away with the page; for a
// page without a list it simply sits above the body. Lists pad their bottom by `useTabPad()`.
export function TabPage({ title, subtitle, right, noActions, navy, children }: Props) {
  const c = useColors();
  const [claimed, setClaimed] = useState(false);
  const header = useMemo(() => (
    <View>
      {navy ? null : <TopBar right={right} noActions={noActions} />}
      {navy ? (
        subtitle ? <View style={st.navyLine}><Text variant="small" tone="gray" numberOfLines={3}>{subtitle}</Text></View> : null
      ) : (
        <View style={st.titles}>
          <Text variant="h2" numberOfLines={2}>{title}</Text>
          {subtitle ? <Text variant="small" tone="gray" numberOfLines={3}>{subtitle}</Text> : null}
        </View>
      )}
      {noActions ? null : <HeaderExtra />}
    </View>
  ), [title, subtitle, right, noActions, navy]);
  const ctx = useMemo(() => ({ header, claim: () => setClaimed(true) }), [header]);
  return (
    <View style={[st.fill, { backgroundColor: c.canvas }]}>
      {navy ? <NavyBar title={title} /> : null}
      <TabHeaderProvider value={ctx}>
        {claimed ? null : header}
        <View style={st.fill}>{children}</View>
      </TabHeaderProvider>
    </View>
  );
}

// Bottom padding that ends a list a little above the floating tab bar. The iOS system bar is part of the safe area (`insets.bottom` already reaches its
// top); the Android bar floats over the page.
export function useTabClearance(gap = 16): number {
  const b = useInsets().bottom;
  const hidden = useTabBarHidden((s) => s.hidden); // no bar (the Hujjatlar catalogue): no room reserved for it
  return Platform.OS === "ios" || hidden ? b + gap : b + 76 + gap;
}

// Bottom padding that keeps list content clear of the floating tab bar (the older, roomier rule).
export const useTabPad = (): number => useInsets().bottom + 120;

const st = StyleSheet.create({
  fill: { flex: 1 },
  titles: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, gap: 4 },
  navyLine: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
});
