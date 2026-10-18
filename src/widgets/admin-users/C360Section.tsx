import type { C360Row } from "@/entities/admin-users";
import { SectionCard, StatusPill } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { View } from "react-native";
import { fmtDate } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";

// One list of the client 360 (orders, payments, leads …): title, who / what, status, amount and date per line.
export function C360Section({ title, rows, max = 6 }: { title: string; rows: C360Row[]; max?: number }) {
  const { t, locale } = useT();
  if (!rows.length) return null;
  return (
    <SectionCard title={`${title} · ${rows.length}`}>
      {rows.slice(0, max).map((r) => (
        <View key={r.id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1, gap: 1 }}>
            <Text variant="small" weight="semibold" numberOfLines={2}>{r.title}</Text>
            <Text variant="caption" tone="gray" numberOfLines={1}>{[r.subtitle, fmtDate(r.date, locale)].filter(Boolean).join(" · ")}</Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 3 }}>
            {r.amount ? <Text variant="small" weight="bold">{fmtMoney(r.amount)} {t("adm.currency")}</Text> : null}
            {r.status ? <StatusPill status={r.status} /> : null}
          </View>
        </View>
      ))}
    </SectionCard>
  );
}
