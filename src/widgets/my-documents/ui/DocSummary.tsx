import { StyleSheet, View } from "react-native";
import { Card, Icon, Pill, Text } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { MODE_ICON, StatusBadge, flowOf, groupOf, toneOf, useToneColor, type MyDoc } from "@/entities/my-document";
import { StatusTimeline } from "./StatusTimeline";

// Head of the detail screen: what the document is, then one status block (a pulsing badge, what happens next, the
// four-step timeline) and the key facts.
export function DocSummary({ doc, paid }: { doc: MyDoc; paid: boolean }) {
  const { t, locale } = useT();
  const c = useColors();
  const color = useToneColor();
  const tone = toneOf(doc.status);
  const group = groupOf(doc.status);
  const steps = flowOf(doc);
  const bg = { ok: c.okBg, warn: c.warnBg, blue: c.tint, err: c.errBg, gray: c.surface2 }[tone];
  return (
    <Card style={s.card}>
      <View style={s.head}>
        <View style={[s.icon, { backgroundColor: `${color(tone)}22` }]}><Icon name={MODE_ICON[doc.mode]} size={22} color={color(tone)} /></View>
        <View style={s.col}>
          <Text variant="h4" numberOfLines={4}>{doc.title || t("dm1.untitled")}</Text>
          {doc.workId ? <Text variant="small" tone="gray" selectable>{doc.workId}</Text> : null}
        </View>
      </View>
      <View style={[s.status, { backgroundColor: bg }]}>
        <View style={s.pills}>
          <StatusBadge status={doc.status} label={doc.statusLabel} small={false} />
          <Pill label={t(`dm1.mode.${doc.mode}`)} tone="gray" icon={MODE_ICON[doc.mode]} small />
        </View>
        {group !== "closed" ? <Text variant="small" tone={group === "ready" ? "ok" : "ink"}>{t(`dm2.next.${group}`)}</Text> : null}
        {steps ? <StatusTimeline steps={steps} paid={paid} /> : null}
      </View>
      <FactRows rows={[
        { label: t("dm3.type"), value: doc.requestedType },
        { label: t("dm3.advocate"), value: doc.lawyer },
        { label: t("dm3.price"), value: doc.price > 0 ? `${fmtMoney(doc.price)} ${t("adm.currency")}` : t("dm3.free") },
        { label: t("dm3.pages"), value: doc.pageCount > 0 ? String(doc.pageCount) : undefined },
        { label: t("dm3.created"), value: fmtDateTime(doc.createdAt, locale) },
      ]} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 14 },
  head: { flexDirection: "row", gap: 12 },
  col: { flex: 1, gap: 4 },
  icon: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  status: { gap: 12, padding: 14, borderRadius: 18 },
  pills: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
});
