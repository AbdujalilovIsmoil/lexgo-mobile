import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useIsAuthed } from "@/entities/session";
import { FocusStatusBar, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useActiveWorks } from "./useActiveWorks";

type Chip = { key: string; label: string; href: Href };

// The top of Home under the fixed bar (DashTopBar, whose height is `top`): Adliya's quick chips inside the navy band — the client's active
// requests, meetings and payments (signed in), the urgent advocate and the document catalogue. The band itself is DashBackdrop; `onLayout`
// tells Home where the hero ends, so the band ends there too.
export function DashHero({ top, onLayout }: { top: number; onLayout?: (e: LayoutChangeEvent) => void }) {
  const authed = useIsAuthed();
  return (
    <View onLayout={onLayout} style={[s.hero, { paddingTop: top + TITLE_GAP }]}>
      <FocusStatusBar style="light" />
      {authed ? <AuthedChips /> : <Chips items={[]} />}
    </View>
  );
}

// A signed-in client's chips start with the count of their active works (the same list the "Faol ishlar" row shows).
function AuthedChips() {
  const { t } = useT();
  const w = useActiveWorks();
  const n = w.active.length;
  const items: Chip[] = [
    { key: "active", label: w.loading ? t("cdash.home.works.title") : n ? t("cdash.home.chipActive", { n }) : t("cdash.home.chipActive0"), href: "/(tabs)/orders" as Href },
    { key: "meet", label: t("cdash.home.chipMeet"), href: "/meetings" as Href },
    { key: "pay", label: t("cdash.home.chipPay"), href: "/payments" as Href },
  ];
  return <Chips items={items} />;
}

function Chips({ items }: { items: Chip[] }) {
  const { t } = useT();
  const router = useRouter();
  const all: Chip[] = [
    ...items,
    { key: "urgent", label: t("cdash.home.chipUrgent"), href: "/urgent" as Href },
    { key: "docs", label: t("cdash.home.chipDocs"), href: "/(tabs)/services?docs=1" as Href },
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} style={s.scroller}>
      {all.map((x) => (
        <PressableScale key={x.key} onPress={() => router.push(x.href)} scale={0.95} style={s.chip} accessibilityRole="button" accessibilityLabel={x.label}>
          <Text variant="caption" weight="bold" numberOfLines={1} maxFontSizeMultiplier={1.15} style={s.chipTx}>{x.label}</Text>
        </PressableScale>
      ))}
    </ScrollView>
  );
}

const TITLE_GAP = 4; // with the bar's own 8 below its row: the chips' 12 under the row in the mock

const s = StyleSheet.create({
  hero: { paddingBottom: 14 },
  scroller: { flexGrow: 0 },
  chips: { paddingHorizontal: 16, gap: 6 },
  chip: { height: 30, paddingHorizontal: 11, borderRadius: 999, justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  chipTx: { color: "#E3EBFB", fontSize: 12, lineHeight: 15 },
});
