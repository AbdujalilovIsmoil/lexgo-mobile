import { StyleSheet, View } from "react-native";
import type { ClientDetail } from "@/entities/pro-clients";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { Avatar, Pill, Text } from "@/shared/ui";

// Top of the client card: big monogram, the name, company · region and the two facts worth a glance (own-base client, client since).
export function ClientHero({ d }: { d: ClientDetail }) {
  const { t, locale } = useT();
  const sub = [d.company, d.region].filter(Boolean).join(" · ");
  return (
    <View style={s.row}>
      <Avatar name={d.name || "?"} size={64} />
      <View style={s.col}>
        <Text variant="h3" numberOfLines={2}>{d.name}</Text>
        {sub ? <Text variant="small" tone="gray" numberOfLines={1}>{sub}</Text> : null}
        <View style={s.facts}>
          {d.manual ? <Pill small tone="gray" icon="edit-3" label={t("aw3.manual")} /> : null}
          {d.createdAt ? <Text variant="caption" tone="gray2">{t("aw3.since", { date: fmtDate(d.createdAt, locale) })}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  col: { flex: 1, gap: 3 },
  facts: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 2 },
});
