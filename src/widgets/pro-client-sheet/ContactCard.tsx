import { StyleSheet, View } from "react-native";
import type { ClientDetail } from "@/entities/pro-clients";
import { useT } from "@/shared/i18n";
import { openTel } from "@/shared/lib/links";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";

type Row = { key: string; icon: IconName; label: string; value: string; onPress?: () => void };

// Contact facts in one grouped card (phone is tappable to call), the lawyer's own note as its last row.
export function ContactCard({ d }: { d: ClientDetail }) {
  const { t } = useT();
  const c = useColors();
  const all: (Row | null)[] = [
    d.phone ? { key: "phone", icon: "phone", label: t("aw3.f.phone"), value: d.phone, onPress: () => openTel(d.phone) } : null,
    d.company ? { key: "company", icon: "briefcase", label: t("aw3.f.company"), value: d.company } : null,
    d.region ? { key: "region", icon: "map-pin", label: t("aw3.region"), value: d.region } : null,
    d.notes ? { key: "notes", icon: "file-text", label: t("aw3.f.notes"), value: d.notes } : null,
  ];
  const rows = all.filter((x): x is Row => !!x);
  if (!rows.length) return null;
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      {rows.map((r, i) => {
        const body = (
          <>
            <View style={[s.icon, { backgroundColor: c.surface2 }]}><Icon name={r.icon} size={17} tone="gray" /></View>
            <View style={s.col}>
              <Text variant="caption" tone="gray">{r.label}</Text>
              <Text variant="body" weight={r.onPress ? "semibold" : "regular"} tone={r.onPress ? "accent" : "ink"}>{r.value}</Text>
            </View>
            {r.onPress ? <Icon name="chevron-right" size={18} tone="gray" /> : null}
          </>
        );
        const style = [s.row, i > 0 && { borderTopWidth: 1, borderTopColor: c.line }];
        return r.onPress ? (
          <PressableScale key={r.key} onPress={r.onPress} scale={0.99} accessibilityRole="button" accessibilityLabel={`${r.label}: ${r.value}`} style={style}>{body}</PressableScale>
        ) : (
          <View key={r.key} style={style}>{body}</View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, minHeight: 56 },
  icon: { width: 34, height: 34, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
});
