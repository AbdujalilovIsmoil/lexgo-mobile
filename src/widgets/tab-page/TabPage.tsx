import { useMemo, useState, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { HeaderExtra } from "@/shared/ui/headerExtra";
import { TabHeaderProvider } from "./tabScroll";
import { TopBar } from "./TopBar";

type Props = { title: string; subtitle?: string; right?: ReactNode; noActions?: boolean; children: ReactNode };

// Frame of a bottom-tab page. The header is the same everywhere: the Home row (logo, greeting, name, tools,
// support, bell, avatar), then the big title with its text, then the banner. Nothing is pinned: a list inside
// puts `useTabHeader()` in its ListHeaderComponent so the header scrolls away with the page; for a page
// without a list the header simply sits above the body. Lists pad their bottom by `useTabPad()`.
export function TabPage({ title, subtitle, right, noActions, children }: Props) {
  const c = useColors();
  const [claimed, setClaimed] = useState(false);
  const header = useMemo(() => (
    <View>
      <TopBar right={right} noActions={noActions} />
      <View style={st.titles}>
        <Text variant="h2" numberOfLines={2}>{title}</Text>
        {subtitle ? <Text variant="small" tone="gray" numberOfLines={3}>{subtitle}</Text> : null}
      </View>
      {noActions ? null : <HeaderExtra />}
    </View>
  ), [title, subtitle, right, noActions]);
  const ctx = useMemo(() => ({ header, claim: () => setClaimed(true) }), [header]);
  return (
    <View style={[st.fill, { backgroundColor: c.canvas }]}>
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
  return Platform.OS === "ios" ? b + gap : b + 76 + gap;
}

// Bottom padding that keeps list content clear of the floating tab bar (the older, roomier rule).
export const useTabPad = (): number => useInsets().bottom + 120;

const st = StyleSheet.create({
  fill: { flex: 1 },
  titles: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, gap: 4 },
});
