import { StyleSheet, View } from "react-native";
import { periodOf, type ExpPosDiff, type ExpPosition } from "@/entities/pro-experience";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Every position of an entry with its period, newest first ("Katta advokat · 2022 – hozirgacha"); `big` for the card's own lines.
export function PositionList({ list, big }: { list: ExpPosition[]; big?: boolean }) {
  const { t } = useT();
  const now = t("mf.exp.now");
  return (
    <View style={s.col}>
      {list.map((p, i) => (
        <View key={`${i}:${p.title}:${p.startedAt}`}>
          <Text variant={big ? "small" : "caption"} weight="semibold" tone={big ? "ink" : "gray"}>{`${p.title || "—"} · ${periodOf(p, now)}`}</Text>
          {big && p.description ? <Text variant="caption" tone="gray" numberOfLines={2}>{p.description}</Text> : null}
        </View>
      ))}
    </View>
  );
}

// How a revision's positions differ from the earlier one's: added, removed and edited ones by title.
export function PositionChanges({ diff, tone = "gray" }: { diff: ExpPosDiff; tone?: "gray" | "gray2" }) {
  const { t } = useT();
  const rows = ([["added", diff.added], ["removed", diff.removed], ["edited", diff.edited]] as const).filter(([, l]) => l.length);
  if (!rows.length) return null;
  return (
    <View style={s.col}>
      {rows.map(([k, l]) => <Text key={k} variant="caption" tone={tone}>{t(`pxp.pos.${k}`, { list: l.join(", ") })}</Text>)}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 2 } });
