import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { Button, Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

export type DocActionHandlers = { onView: () => void; onDownload: () => void; onLawyer: () => void; onFill: () => void };
// The document service settings (TZ.md §4) on filling in yourself and on the advocate: offered, switched off, or outside the plan.
export type DocWays = { fill: "open" | "off" | "locked"; lawyer: "open" | "off" | "locked" };
// `locked`: the plan does not give template downloads (the backend's feature state); `note`: what is left of a limited one.
// `variant`: "list" — the service page's ways (Adliya), "tiles" — the compact row of a catalogue card.
type Props = DocActionHandlers & { hasDoc: boolean; advokatOnly: boolean; locked: boolean; note?: string; downloading: boolean; error?: string; ways?: DocWays; variant?: "list" | "tiles" };
const OPEN: DocWays = { fill: "open", lawyer: "open" };

type WayProps = { icon: IconName; title: string; sub: string; onPress: () => void; badge?: string; busy?: boolean; primary?: boolean; top?: boolean };

// One way forward (Adliya .way): the icon on a soft tile, the title and a line under it, a chevron — the primary one is the solid blue card.
// A small corner badge (PRO / TOP) where the web puts one.
function Way({ icon, title, sub, onPress, badge, busy, primary, top }: WayProps) {
  const { colors: c, dark, glass } = useTheme();
  const fg = primary ? "#FFFFFF" : top ? c.warn : c.accent;
  return (
    <PressableScale
      onPress={onPress}
      scale={0.98}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[s.way, primary ? { backgroundColor: c.accent, borderColor: c.accent } : { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E2E8F1" }, !primary && !glass && s.shadow]}
    >
      <View style={[s.ico, { backgroundColor: primary ? "rgba(255,255,255,0.2)" : top ? c.warnBg : c.tint2 }]}>
        {busy ? <ActivityIndicator color={fg} /> : <Icon name={icon} size={20} color={fg} />}
      </View>
      <View style={s.tx}>
        <View style={s.titleRow}>
          <Text variant="h4" numberOfLines={1} style={[s.title, primary && { color: "#FFFFFF" }]}>{title}</Text>
          {badge ? <View style={[s.badge, { backgroundColor: primary ? "rgba(255,255,255,0.25)" : top ? c.warn : c.accent }]}><Text variant="caption" weight="bold" tone="white" style={s.badgeT}>{badge}</Text></View> : null}
        </View>
        <Text variant="caption" weight="regular" numberOfLines={2} style={[s.sub, { color: primary ? "rgba(255,255,255,0.85)" : c.gray }]}>{sub}</Text>
      </View>
      <Icon name="chevron-right" size={18} color={primary ? "#FFFFFF" : c.ink} />
    </PressableScale>
  );
}

// The ways forward from a document service, as the design's list: fill it in yourself (the primary, blue), look at the blank sample, download it
// (paid plans), hand it to an advocate. A service without a template has only the advocate button. A way the platform switched off is not
// shown; one outside the plan carries a lock, and its page says why.
export function DocActions(props: Props) {
  const { hasDoc, advokatOnly, locked, note, downloading, error, onView, onDownload, onLawyer, onFill, ways = OPEN, variant = "tiles" } = props;
  const { t } = useT();
  if (variant === "tiles" && hasDoc) return <DocTiles {...props} ways={ways} />;
  if (!hasDoc) return <View style={s.col}><Button title={t("csv.sendToLawyer")} icon="users" variant="line" size="sm" onPress={onLawyer} full />{error ? <Text variant="caption" tone="err">{error}</Text> : null}</View>;
  const withLawyer = ways.lawyer !== "off";
  return (
    <View style={s.col}>
      {ways.fill === "off" ? null : <Way primary icon={ways.fill === "locked" ? "lock" : "edit-3"} title={t("csv.fillDoc")} sub={t("csv.waySub.fill")} onPress={onFill} />}
      {withLawyer ? (
        <Way icon={ways.lawyer === "locked" ? "lock" : "headphones"} title={t("csv.sendToLawyer")} sub={advokatOnly ? t("csv.badgeTopHint") : t("csv.waySub.lawyer")} onPress={onLawyer} badge={advokatOnly ? t("csv.badgeTop") : undefined} top={advokatOnly} />
      ) : null}
      <Way icon="eye" title={t("csv.viewDoc")} sub={t("csv.waySub.view")} onPress={onView} />
      <Way icon={locked ? "lock" : "download"} title={downloading ? t("csv.downloading") : t("csv.download")} sub={locked ? t("csv.badgeProHint") : note || t("csv.waySub.download")} onPress={onDownload} busy={downloading} badge={locked ? t("csv.badgePro") : undefined} />
      {error ? <Text variant="caption" tone="err">{error}</Text> : null}
    </View>
  );
}

type TileProps = { icon: IconName; label: string; onPress: () => void; badge?: string; busy?: boolean; tone?: "lock" | "top" };

// A square-ish action of the compact row: the icon above a one-line label, with a small corner badge (PRO / TOP).
function Tile({ icon, label, onPress, badge, busy, tone }: TileProps) {
  const { colors: c } = useTheme();
  const tint = tone === "top" ? c.warn : c.accent;
  return (
    <PressableScale onPress={onPress} scale={0.96} accessibilityRole="button" style={[s.tile, { backgroundColor: c.surface2, borderColor: c.line }]}>
      {busy ? <ActivityIndicator color={tint} /> : <Icon name={icon} size={20} color={tint} />}
      <Text variant="caption" weight="semibold" numberOfLines={2} center>{label}</Text>
      {badge ? <View style={[s.tileBadge, { backgroundColor: tint }]}><Text variant="caption" weight="bold" tone="white" style={s.badgeT}>{badge}</Text></View> : null}
    </PressableScale>
  );
}

// The compact ways of a catalogue card: sample, download, advocate as three tiles, then filling in yourself as the one primary button.
function DocTiles({ advokatOnly, locked, note, downloading, error, onView, onDownload, onLawyer, onFill, ways = OPEN }: Props) {
  const { t } = useT();
  const lawyer = { icon: ways.lawyer === "locked" ? ("lock" as const) : ("users" as const), label: t("csv.sendToLawyer"), onPress: onLawyer, badge: advokatOnly ? t("csv.badgeTop") : undefined, tone: advokatOnly ? ("top" as const) : undefined };
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
  row: { flexDirection: "row", gap: 8 },
  tile: { flex: 1, minHeight: 72, alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 6, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  tileBadge: { position: "absolute", top: -7, right: 6, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  col: { gap: 10 },
  way: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 74, padding: 14, borderRadius: 18, borderWidth: 1 },
  ico: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tx: { flex: 1, minWidth: 0, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 15, lineHeight: 20, flexShrink: 1 },
  sub: { fontSize: 12.5, lineHeight: 17 },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  badgeT: { fontSize: 10, lineHeight: 14 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
