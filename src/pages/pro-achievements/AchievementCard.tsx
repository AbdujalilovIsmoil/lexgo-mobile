import { StyleSheet, View } from "react-native";
import { dayText, typeLabel, type AchRecord } from "@/entities/pro-achievements";
import { EvidenceList, evidenceFile } from "@/entities/pro-experience";
import { Card, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { StatePill } from "./StatePill";

// One achievement: its type and state, title, date and category, a short description, the reviewer's reason when it was not approved,
// and the supporting files, which open in the app's viewer.
export function AchievementCard({ a, category }: { a: AchRecord; category: string }) {
  const { t, locale } = useT();
  const c = useColors();
  const files = a.evidence.map((e, i) => ({ key: e.id, name: e.fileName || t("pxp.ev.file", { n: i + 1 }), file: evidenceFile(e) }));
  const meta = [dayText(a.achievedAt, locale), category].filter(Boolean).join(" · ");
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <Text variant="small" weight="bold" tone="accent" style={s.flex}>{typeLabel(a.type, t) || "—"}</Text>
        <StatePill status={a.status} />
      </View>
      <Text variant="body" weight="bold">{a.title}</Text>
      {meta ? <Text variant="caption" tone="gray">{meta}</Text> : null}
      {a.description ? <Text variant="small" numberOfLines={4}>{a.description}</Text> : null}
      <EvidenceList rows={files} />
      {a.rejectionReason && a.status !== "approved" ? <View style={[s.note, { backgroundColor: a.status === "rejected" ? c.errBg : c.surface2 }]}><Text variant="caption" tone={a.status === "rejected" ? "err" : "gray"}>{t("ach.reason", { text: a.rejectionReason })}</Text></View> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  note: { padding: 10, borderRadius: 12 },
});
