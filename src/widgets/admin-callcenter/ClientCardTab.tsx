import { View } from "react-native";
import { useCcLabel, type ClientCard } from "@/entities/admin-callcenter";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

export type CardTab = "orders" | "payments" | "leads" | "activity";

// The rows of one card tab (or its empty note).
export function ClientCardTab({ card, tab }: { card: ClientCard; tab: CardTab }) {
  const { t, locale } = useT();
  const label = useCcLabel();
  const at = (v: string) => fmtDateTime(v, locale);
  const rows =
    tab === "orders"
      ? card.orders.map((o) => ({ id: o.id, title: o.title || "—", sub: [o.lawyerName, at(o.createdAt)].filter(Boolean).join(" · "), st: o.status }))
      : tab === "payments"
        ? card.payments.map((p) => ({ id: p.id, title: `${fmtMoney(p.amount)} ${t("adm.currency")}`, sub: [p.description || label("admCcC.payKind", p.kind), at(p.createdAt)].filter(Boolean).join(" · "), st: p.status }))
        : tab === "leads"
          ? card.leads.map((l) => ({ id: l.id, title: label("admCc.cat", l.category) || t("admCc.noName"), sub: [label("admCcC.src", l.source), l.region, at(l.createdAt)].filter(Boolean).join(" · "), st: l.status }))
          : card.activities.slice(0, 15).map((a) => ({ id: a.id, title: label("admCcC.act", a.action), sub: [a.detail, at(a.createdAt)].filter(Boolean).join(" · "), st: "" }));
  if (!rows.length) return <Text variant="small" tone="gray" center>{t(`admCcC.none.${tab}`)}</Text>;
  return (
    <View style={{ gap: 10 }}>
      {rows.map((r) => <RowCard key={r.id} title={r.title} subtitle={r.sub} right={r.st ? <StatusPill status={r.st} label={tab === "leads" ? label("admCc.qStatus", r.st) : undefined} /> : undefined} />)}
    </View>
  );
}
