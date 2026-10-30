import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BottomSheet, Card, ErrorView, Icon, PressableScale, SheetScroll, Skeleton, Text, type IconName } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { channelsOf, fromPrice, isGroupKind, kindIcon, kindTint, minutesOf, orderHref, useCatalog, useUrgentLabels, type UrgentService } from "@/entities/urgent";

const FLOWS: { kind: "custom" | "review"; icon: IconName; title: string; sub: string }[] = [
  { kind: "custom", icon: "edit-3", title: "cxUg.scratchTitle", sub: "cxUg.scratchSub" },
  { kind: "review", icon: "clipboard", title: "cxUg.reviewTitle", sub: "cxUg.reviewSub" },
];

// "Xizmatni tanlang": every service of the catalog, one row each in one card — icon tile in the service's colour, name, how it runs
// (channel · length, the panel size, or "on a document"), the price, a chevron — and the document flows as the last row (a sheet with
// the two duty-advocate document ways). A row opens the order form.
export function ServiceList() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark } = useTheme();
  const label = useUrgentLabels();
  const cat = useCatalog();
  const [docs, setDocs] = useState(false);
  if (cat.isLoading) return <Skeleton height={320} round={20} />;
  if (cat.isError) return <ErrorView error={cat.error} onRetry={() => void cat.refetch()} compact />;
  const services = cat.data?.services ?? [];
  const sub = (x: UrgentService) => {
    if (isGroupKind({ serviceKind: x.key })) return t("ug1.page.lawyersRange", { min: x.lawyerCountMin || 1, max: x.lawyerCountMax || x.lawyerCountMin || 1 });
    if (x.key.startsWith("second_opinion")) return t("ug1.page.byDoc");
    const ch = channelsOf(x)[0] ?? "video";
    const mins = minutesOf(x, ch);
    return [label.channel(ch), mins ? t("ug4.minutesN", { n: mins }) : ""].filter(Boolean).join(" · ");
  };
  const price = (x: UrgentService) => {
    const p = fromPrice(x);
    if (!p.amount) return "";
    return p.perLawyer || x.variants.length > 1 ? t("ug1.page.priceFrom", { price: fmtMoney(p.amount) }) : `${fmtMoney(p.amount)} ${t("common.currency")}`;
  };
  const line = dark ? c.line : "#E9EDF4";
  const rows = [
    ...services.map((x) => ({ key: x.key, icon: kindIcon(x.key), tint: kindTint(x.key), title: label.kind(x.key, x.title), sub: sub(x), price: price(x), lock: x.requiresPriorPurchase, onPress: () => router.push(orderHref(x.key, "urgent")) })),
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
                <Text variant="small" tone="gray" numberOfLines={1} style={s.flex}>{r.sub}</Text>
              </View>
            </View>
            {r.price ? <Text variant="small" weight="bold" tone="accent" style={s.price}>{r.price}</Text> : null}
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
  subRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  price: { maxWidth: 110, textAlign: "right" },
  flow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
});
