import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { DEADLINE_CHOICES, type Deadlines } from "@/entities/pro-availability";
import { radius, useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { Stepper } from "@/shared/ui/sel";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

const KINDS = ["manual", "auto", "sos"] as const;

// How fast the seller answers a new order (regular · automatic assignment · SOS): big tiles per kind, plus
// "Other" for any whole number of minutes from 1 to 1440. Counted in working time.
export function DeadlinesCard({ value, onChange }: { value: Deadlines; onChange: (k: keyof Deadlines, n: number) => void }) {
  const { t } = useT();
  const c = useColors();
  const [custom, setCustom] = useState<Record<string, boolean>>({});
  const fmt = (n: number) => (n < 60 ? t("availUx.mins", { n }) : n % 60 ? t("availUx.hoursMin", { h: Math.floor(n / 60), m: n % 60 }) : t("availUx.hours", { h: n / 60 }));
  const tile = (label: string, on: boolean, onPress: () => void, key: string) => (
    <PressableScale
      key={key}
      haptic={false}
      accessibilityLabel={label}
      accessibilityState={{ selected: on }}
      onPress={() => { selectHaptic(); onPress(); }}
      style={[s.tile, { backgroundColor: on ? c.tint2 : c.surface2, borderColor: on ? c.accent : c.line }]}
    >
      <Text variant="body" weight="bold" style={{ color: on ? c.accentStrong : c.ink }}>{label}</Text>
    </PressableScale>
  );
  return (
    <SectionCard title={t("availUx.dlTitle")}>
      {KINDS.map((k) => {
        const choices = DEADLINE_CHOICES[k] as readonly number[];
        const isCustom = custom[k] || !choices.includes(value[k]);
        return (
          <View key={k} style={s.kind}>
            <Text variant="body" weight="semibold">{t(`sl8.dl.${k}`)}</Text>
            <Text variant="caption" tone="gray">{t(`availUx.dlx.${k}`)}</Text>
            <View style={s.tiles}>
              {choices.map((n) => tile(fmt(n), !isCustom && value[k] === n, () => { setCustom((x) => ({ ...x, [k]: false })); onChange(k, n); }, String(n)))}
              {tile(t("availUx.other"), isCustom, () => setCustom((x) => ({ ...x, [k]: true })), "other")}
            </View>
            {isCustom ? <Stepper label={fmt(value[k])} value={value[k]} min={1} max={1440} step={k === "sos" ? 1 : 5} suffix={t("common.minutesShort")} onChange={(n) => onChange(k, n)} /> : null}
          </View>
        );
      })}
      <Text variant="caption" tone="gray2">{t("availUx.dlNote")}</Text>
    </SectionCard>
  );
}

const s = StyleSheet.create({
  kind: { gap: 6, paddingBottom: 6 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 4 },
  tile: { minHeight: 48, minWidth: 72, flexGrow: 1, flexBasis: "30%", paddingHorizontal: 12, borderRadius: radius.r, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});
