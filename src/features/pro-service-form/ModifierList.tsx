import { StyleSheet, View } from "react-native";
import type { Modifier } from "@/entities/pro-service";
import { useColors } from "@/shared/theme";
import { Text } from "@/shared/ui";
import { humanizeSlug } from "@/shared/lib/format";
import { regionKeyOf } from "@/entities/pro-profile";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";

// "+20 %" / "×1.15" — what a factor does to the base price.
const effect = (m: Modifier): string | null =>
  m.percent !== null && (m.code !== "region" || m.multiplier === null) ? `${m.percent > 0 ? "+" : m.percent < 0 ? "−" : ""}${Math.abs(m.percent)}%` : m.multiplier !== null ? `×${m.multiplier.toFixed(2)}` : null;

// The factors the server applied to the ceiling (TZ 19: region, experience, sector experience, rating, client score).
export function ModifierList({ modifiers }: { modifiers: Modifier[] }) {
  const { t } = useT();
  const c = useColors();
  const som = useSom();
  const label = (m: Modifier) => {
    if (m.label) return m.label;
    if (m.code === "region" && m.key && m.key !== "default") return `${t("sl7.mod.region")}: ${t(`lawyers.regions.${regionKeyOf(m.key.replace(/_city$/, ""))}`)}`;
    const k = `sl7.mod.${m.code}`;
    return t(k).startsWith("sl7.") ? humanizeSlug(m.code) : t(k);
  };
  const rows = modifiers.filter((m) => effect(m) || m.amount);
  if (!rows.length) return null;
  return (
    <View style={s.col}>
      {rows.map((m, i) => (
        <View key={`${m.code}-${i}`} style={s.row}>
          <Text variant="caption" tone="gray" style={s.label}>{label(m)}</Text>
          <Text variant="caption" weight="bold" style={{ color: (m.amount ?? 0) < 0 || (m.percent ?? 0) < 0 ? c.err : c.ok }}>{effect(m)}{m.amount ? ` (${m.amount > 0 ? "+" : "−"}${som(Math.abs(m.amount))})` : ""}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 4, marginTop: 4 }, row: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, label: { flex: 1 } });
