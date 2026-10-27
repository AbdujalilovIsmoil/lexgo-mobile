import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import { Icon, Text } from "@/shared/ui";
import { anyOfOptions, barPercent, isPercentKey, partsOf, type Part } from "./requirements";
import type { ReqValue, Requirement } from "./types";

// One pricing criterion: its name, done or not (the backend's `met`), the progress bar (progress_percent; only the bar is clamped),
// the seller's value against the target, and for `required.any_of` that any one alternative is enough. Keys this app does not
// know yet show the backend's name or the key made readable.
export function RequirementRow({ r }: { r: Requirement }) {
  const c = useColors();
  const { t } = useT();
  const known = (k: string) => (t(k) === k ? "" : t(k));
  const name = known(`scfg.req.${r.key}`) || r.label || humanizeSlug(r.key);
  const shown = (p: Part): string => {
    if (p.value === null || p.value === "") return "—";
    if (typeof p.value === "boolean") return t(p.value ? "scfg.yes" : "scfg.no");
    if (typeof p.value === "number" && isPercentKey(p.key)) return `${p.value}%`;
    if (typeof p.value === "number" && !p.key && r.unit === "year") return t("scfg.years", { n: p.value });
    return String(p.value);
  };
  const text = (v: ReqValue | Record<string, unknown>, join: string) => partsOf(v).map((p) => (p.key ? `${known(`scfg.metric.${p.key}`) || humanizeSlug(p.key)} ${shown(p)}` : shown(p))).join(join);
  const options = anyOfOptions(r.required);
  const now = t("scfg.reqNow", { value: text(r.current, " · ") });
  const need = options ? t("scfg.reqAnyOf") : t("scfg.reqNeed", { value: text(r.required, " · ") });
  const state = t(r.met ? "scfg.reqMet" : "scfg.reqUnmet");
  const tone = r.met ? c.ok : c.accent;
  return (
    <View style={s.row} accessible accessibilityLabel={[name, state, r.progress !== null ? `${r.progress}%` : "", now, need, ...(options ?? []).map((o) => text(o, " + "))].filter(Boolean).join(". ")}>
      <View style={s.head}>
        <Icon name={r.met ? "check-circle" : "circle"} size={18} color={r.met ? c.ok : c.gray} />
        <Text variant="small" weight="semibold" style={s.flex}>{name}</Text>
        {r.progress !== null ? <Text variant="caption" weight="bold" style={{ color: tone }}>{`${r.progress}%`}</Text> : null}
      </View>
      {r.progress !== null ? (
        <View style={[s.track, { backgroundColor: c.surface2 }]}>
          <View style={[s.fill, { width: `${barPercent(r.progress)}%`, backgroundColor: tone }]} />
        </View>
      ) : null}
      <Text variant="caption" tone="gray">{now}</Text>
      <Text variant="caption" tone="gray">{need}</Text>
      {options?.map((o, i) => <Text key={i} variant="caption" tone="gray">{`• ${text(o, " + ")}`}</Text>)}
      {r.note ? <Text variant="caption" tone="gray2">{r.note}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { gap: 4, paddingVertical: 6 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 28 },
  flex: { flex: 1 },
  track: { height: 6, borderRadius: 3, overflow: "hidden", marginVertical: 2 },
  fill: { height: 6, borderRadius: 3 },
});
