import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Button, Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

export type DocActionHandlers = { onView: () => void; onDownload: () => void; onLawyer: () => void; onFill: () => void };
// The document service settings (TZ.md §4) on filling in yourself and on the advocate: offered, switched off, or outside the plan.
export type DocWays = { fill: "open" | "off" | "locked"; lawyer: "open" | "off" | "locked" };
// `locked`: the plan does not give template downloads (the backend's feature state); `note`: what is left of a limited one.
type Props = DocActionHandlers & { hasDoc: boolean; advokatOnly: boolean; locked: boolean; note?: string; downloading: boolean; error?: string; ways?: DocWays };
const OPEN: DocWays = { fill: "open", lawyer: "open" };

type TileProps = { icon: IconName; label: string; onPress: () => void; badge?: string; busy?: boolean; tone?: "lock" | "top" };

// A square-ish action: the icon above a one-line label, with a small corner badge (PRO / TOP) where the web puts one.
function Tile({ icon, label, onPress, badge, busy, tone }: TileProps) {
  const c = useColors();
  const tint = tone === "top" ? c.warn : c.accent;
  return (
    <PressableScale onPress={onPress} scale={0.96} accessibilityRole="button" style={[s.tile, { backgroundColor: c.surface2, borderColor: c.line }]}>
      {busy ? <ActivityIndicator color={tint} /> : <Icon name={icon} size={20} color={tint} />}
      <Text variant="caption" weight="semibold" numberOfLines={2} center>{label}</Text>
      {badge ? <View style={[s.badge, { backgroundColor: tint }]}><Text variant="caption" weight="bold" tone="white" style={s.badgeT}>{badge}</Text></View> : null}
    </PressableScale>
  );
}

// The ways forward from a service, in the web card's order: look at the blank sample, download it (paid plans),
// hand it to an advocate, fill it in yourself (the one primary button). A service without a template has only the advocate button.
// A way the platform switched off is not shown; one outside the plan carries a lock, and its page says why.
export function DocActions({ hasDoc, advokatOnly, locked, note, downloading, error, onView, onDownload, onLawyer, onFill, ways = OPEN }: Props) {
  const { t } = useT();
  const lawyer = { icon: ways.lawyer === "locked" ? ("lock" as const) : ("users" as const), label: t("csv.sendToLawyer"), onPress: onLawyer, badge: advokatOnly ? t("csv.badgeTop") : undefined, tone: advokatOnly ? ("top" as const) : undefined };
  if (!hasDoc) return <View style={s.col}><Button title={lawyer.label} icon="users" variant="line" size="sm" onPress={onLawyer} full />{error ? <Text variant="caption" tone="err">{error}</Text> : null}</View>;
  const withLawyer = ways.lawyer !== "off";
  return (
    <View style={s.col}>
      <View style={s.row}>
        <Tile icon="eye" label={t("csv.viewDoc")} onPress={onView} />
        <Tile icon={locked ? "lock" : "download"} label={downloading ? t("csv.downloading") : t("csv.download")} onPress={onDownload} busy={downloading} badge={locked ? t("csv.badgePro") : undefined} />
        {withLawyer ? <Tile {...lawyer} /> : null}
      </View>
      {locked ? <Text variant="caption" tone="gray2">{t("csv.badgeProHint")}</Text> : note ? <Text variant="caption" tone="gray2">{note}</Text> : null}
      {advokatOnly && withLawyer ? <Text variant="caption" tone="gray2">{t("csv.badgeTopHint")}</Text> : null}
      {ways.fill === "off" ? null : <Button title={t("csv.fillDoc")} icon={ways.fill === "locked" ? "lock" : "edit-3"} variant="gradient" size="sm" onPress={onFill} full />}
      {error ? <Text variant="caption" tone="err">{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", gap: 8 },
  tile: { flex: 1, minHeight: 72, alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 6, paddingVertical: 10, borderRadius: radius.r, borderWidth: 1 },
  badge: { position: "absolute", top: -7, right: 6, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  badgeT: { fontSize: 10, lineHeight: 14 },
});
