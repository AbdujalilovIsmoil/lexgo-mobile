import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BottomSheet, Card, ErrorView, Icon, PressableScale, SheetScroll, Skeleton, Text, type IconName } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { buildCards, channelsOf, fromPrice, kindIcon, kindTint, minutesOf, orderHref, useCatalog, useUrgentLabels, VIDEO_GROUP, type UrgentCard } from "@/entities/urgent";

const FLOWS: { kind: "custom" | "review"; icon: IconName; title: string; sub: string }[] = [
  { kind: "custom", icon: "edit-3", title: "cxUg.scratchTitle", sub: "cxUg.scratchSub" },
  { kind: "review", icon: "clipboard", title: "cxUg.reviewTitle", sub: "cxUg.reviewSub" },
];

// "Xizmatni tanlang": the services of the catalog in one card, kinds that are one decision on one row (ordinary + express video, single +
// panel second opinion — the order form switches between them) — icon tile in the service's colour, the name, under it how it runs
// (channel · length, or single / panel) with the lowest price at the right, a chevron — and the document flows as the last row (a sheet with the two duty-advocate document
// ways). A row opens the order form on its first kind.
export function ServiceList() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark } = useTheme();
  const label = useUrgentLabels();
  const cat = useCatalog();
  const [docs, setDocs] = useState(false);
  if (cat.isLoading) return <Skeleton height={320} round={20} />;
  if (cat.isError) return <ErrorView error={cat.error} onRetry={() => void cat.refetch()} compact />;
  const cards = buildCards(cat.data);
  const sub = (card: UrgentCard) => {
    const panel = card.items.find((x) => x.lawyerCountMax > 1 && x.key === "second_opinion_group");
    if (panel) return t("ug1.page.secondSub", { min: panel.lawyerCountMin || 2, max: panel.lawyerCountMax });
    const x = card.items[0];
    if (x.key.startsWith("second_opinion")) return t("ug1.page.byDoc");
    const ch = channelsOf(x)[0] ?? "video";
    const mins = minutesOf(x, ch);
    return [label.channel(ch), mins ? t("ug4.minutesN", { n: mins }) : ""].filter(Boolean).join(" · ");
  };
  const price = (card: UrgentCard) => {
    // a panel's figure is per advocate: its lowest total is that times the smallest panel
    const all = card.items.map((x) => { const p = fromPrice(x); return { ...p, amount: p.perLawyer ? p.amount * Math.max(1, x.lawyerCountMin) : p.amount }; }).filter((p) => p.amount > 0);
    if (!all.length) return "";
    const low = Math.min(...all.map((p) => p.amount));
    const many = card.items.length > 1 || all.some((p) => p.perLawyer) || card.items[0].variants.length > 1;
    return many ? t("ug1.page.priceFrom", { price: fmtMoney(low) }) : `${fmtMoney(low)} ${t("common.currency")}`;
  };
  const base = (card: UrgentCard) => (card.key === VIDEO_GROUP ? "video_consultation" : card.items[0].key);
  const title = (card: UrgentCard) => (card.group ? label.text(`ug1.groups.${card.key}`, card.group.title || card.key) : label.kind(card.items[0].key, card.items[0].title));
  const line = dark ? c.line : "#E9EDF4";
  const rows = [
    ...cards.map((card) => ({ key: card.key, icon: kindIcon(base(card)), tint: kindTint(base(card)), title: title(card), sub: sub(card), price: price(card), lock: card.items.every((x) => x.requiresPriorPurchase), onPress: () => router.push(orderHref(base(card), "urgent")) })),
    { key: "docs", icon: "file-text" as IconName, tint: "#5C6E85", title: t("cxUg.docsTitle"), sub: t("ug1.page.docsSub"), price: "", lock: false, onPress: () => setDocs(true) },
  ];
  return (
    <View style={s.wrap}>
      <Text variant="caption" weight="bold" tone="gray" style={s.label}>{t("ug1.page.pick").toUpperCase()}</Text>
      <View style={[s.card, { backgroundColor: dark ? c.surface : "#FFFFFF", borderColor: dark ? c.line : "#EEF2FA" }]}>
        {rows.map((r, i) => (
          <PressableScale key={r.key} onPress={r.onPress} scale={0.99} accessibilityRole="button" style={[s.row, i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: line }]}>
            <View style={[s.ico, { backgroundColor: `${r.tint}1A` }]}><Icon name={r.icon} size={20} color={r.tint} /></View>
            <View style={s.flex}>
              <Text variant="h4" numberOfLines={2}>{r.title}</Text>
              <View style={s.subRow}>
                {r.lock ? <Icon name="lock" size={12} tone="gray" /> : null}
                <Text variant="small" tone="gray" numberOfLines={2} style={s.flex}>{r.sub}</Text>
                {r.price ? <Text variant="small" weight="bold" tone="accent" numberOfLines={1}>{r.price}</Text> : null}
              </View>
            </View>
            <Icon name="chevron-right" size={18} tone="gray" />
          </PressableScale>
        ))}
      </View>
      <BottomSheet visible={docs} onClose={() => setDocs(false)} title={t("cxUg.docsTitle")} snaps={[0.5, 0.8]}>
        <SheetScroll>
          <Text variant="small" tone="gray">{t("cxUg.pickLead")}</Text>
          {FLOWS.map((f) => (
            <Card key={f.kind} onPress={() => { setDocs(false); router.push({ pathname: "/documents/new", params: { kind: f.kind } }); }} style={s.flow}>
              <Icon name={f.icon} size={22} tone="accent" />
              <View style={s.flex}>
                <Text variant="body" weight="bold">{t(f.title)}</Text>
                <Text variant="small" tone="gray">{t(f.sub)}</Text>
              </View>
              <Icon name="chevron-right" size={18} tone="gray" />
            </Card>
          ))}
        </SheetScroll>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  label: { letterSpacing: 0.6, marginLeft: 2 },
  card: { borderRadius: 20, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  ico: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  flow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
});
