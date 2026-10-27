import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { gateText, useDocSettings, type DocServiceMode } from "@/entities/doc-settings";
import { useColors } from "@/shared/theme";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { BottomSheet, Card, Icon, SheetScroll, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Opt = { mode: DocServiceMode; icon: IconName; title: string; sub: string; path: string };

// "Order a new document": nothing in the catalogue fits, so the advocate on duty writes one from a
// blank page, checks the client's own, or the AI analyses its text. Only the modes the platform keeps on are offered;
// one outside the plan shows a lock and why (TZ.md §4).
export function NewDocSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const go = useSheetNavigate(onClose);
  const opts = useDocSettings().offer<Opt>([
    { mode: "lawyer", icon: "edit-3", title: t("csv.newDocScratch"), sub: t("csv.newDocScratchSub"), path: "/documents/new?kind=custom" },
    { mode: "review", icon: "clipboard", title: t("csv.newDocReview"), sub: t("csv.newDocReviewSub"), path: "/documents/new?kind=review" },
    { mode: "analysis", icon: "zap", title: t("csv.newDocAnalysis"), sub: t("csv.newDocAnalysisSub"), path: "/doc-analysis" },
  ]);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("csv.newDocOrder")} snaps={[0.62, 0.9]}>
      <SheetScroll>
        <Text variant="body" tone="gray">{t("csv.newDocLead")}</Text>
        {opts.map((o) => {
          const locked = o.gate.state === "locked";
          return (
            <Card key={o.path} onPress={() => go(() => router.push(o.path as never))} style={s.card}>
              <View style={[s.badge, { backgroundColor: c.tint2 }]}><Icon name={locked ? "lock" : o.icon} size={22} color={c.accent} /></View>
              <View style={s.col}>
                <Text variant="h4">{o.title}</Text>
                <Text variant="small" tone="gray">{locked ? gateText(t, o.gate) : o.sub}</Text>
              </View>
              <Icon name="chevron-right" size={18} color={c.gray2} />
            </Card>
          );
        })}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  badge: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
});
