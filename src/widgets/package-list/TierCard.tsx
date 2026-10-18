import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Button, Card, Icon, Pill, Text, type IconName, type PillTone } from "@/shared/ui";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { readable, reasonKey, stateOf, type PackageState, type SellerPackage } from "@/entities/seller-package";

const TIER_ICON: Record<string, IconName> = { BASIC: "package", STANDARD: "star", PREMIUM: "award" };
const STATE_TONE: Record<PackageState, PillTone> = { active: "ok", paused: "warn", available: "gray", blocked: "err" };
const SHOWN = 3;

type Props = { row: SellerPackage; busy: boolean; onEnable: () => void; onPause: () => void; onResume: () => void };

// One tariff of a package: state, the fixed price, what is included, why it is blocked, and the enable / pause / resume action.
export function TierCard({ row, busy, onEnable, onPause, onResume }: Props) {
  const { t } = useT();
  const c = useColors();
  const state = stateOf(row);
  const { pkg, eligibility: el } = row;
  const tariffKey = `mk8.tiers.${pkg.tariff}`;
  const tariff = t(tariffKey) === tariffKey ? pkg.tariff : t(tariffKey);
  const stateLabel = t(`pkgSeller.state.${state}`);
  const extra = pkg.included.length - SHOWN;
  return (
    <Card style={s.card} accessible={false}>
      <View style={s.top} accessible accessibilityLabel={t("pkgSeller.cardLabel", { title: pkg.groupTitle || pkg.title, tariff, state: stateLabel })}>
        <View style={[s.ic, { backgroundColor: c.tint2 }]}>
          <Icon name={TIER_ICON[pkg.tariff] ?? "package"} size={18} color={c.accent} />
        </View>
        <Text variant="h4" style={s.flex}>{tariff}</Text>
        <Pill label={stateLabel} tone={STATE_TONE[state]} small />
      </View>
      <View style={s.priceRow}>
        <Text variant="h3">{fmtMoney(pkg.price)}</Text>
        <Text variant="small" tone="gray">{t("mk8.som")}</Text>
      </View>
      <View style={s.meta}>
        <Icon name="lock" size={13} color={c.gray} />
        <Text variant="caption" tone="gray" style={s.flex}>{t("pkgSeller.fixedPrice")}</Text>
      </View>
      {pkg.duration ? (
        <View style={s.meta}>
          <Icon name="clock" size={13} color={c.gray} />
          <Text variant="caption" tone="gray" style={s.flex}>{pkg.duration}</Text>
        </View>
      ) : null}
      {pkg.included.length ? (
        <View style={s.list}>
          {pkg.included.slice(0, SHOWN).map((x, i) => (
            <View key={`${i}-${x}`} style={s.item}>
              <Icon name="check" size={14} color={c.ok} />
              <Text variant="small" style={s.flex}>{x}</Text>
            </View>
          ))}
          {extra > 0 ? <Text variant="caption" tone="gray">{t("pkgSeller.more", { n: extra })}</Text> : null}
        </View>
      ) : null}
      {pkg.tariff === "PREMIUM" ? (
        <View style={[s.note, { backgroundColor: el.extendedVerified ? c.okBg : c.warnBg }]}>
          <Icon name="shield" size={16} color={el.extendedVerified ? c.ok : c.warn} />
          <Text variant="small" style={[s.flex, { color: el.extendedVerified ? c.ok : c.warn }]}>{t(el.extendedVerified ? "pkgSeller.extendedOk" : "pkgSeller.extendedNeeded")}</Text>
        </View>
      ) : null}
      {!el.eligible ? (
        <View style={[s.note, s.why, { backgroundColor: c.errBg }]} accessibilityRole="alert">
          <View style={s.meta}>
            <Icon name="alert-triangle" size={16} color={c.err} />
            <Text variant="small" weight="bold" style={[s.flex, { color: c.err }]}>{t("pkgSeller.notEligible")}</Text>
          </View>
          {el.reasons.map((r) => (
            <Text key={r} variant="small" style={{ color: c.err }}>{"• "}{reasonKey(r) ? t(reasonKey(r) as string) : readable(r)}</Text>
          ))}
          {el.missingServiceIds.length ? <Text variant="caption" style={{ color: c.err }}>{t("pkgSeller.missingServices", { n: el.missingServiceIds.length })}</Text> : null}
        </View>
      ) : null}
      {state === "active" ? (
        <Button title={busy ? t("pkgSeller.saving") : t("pkgSeller.disable")} icon="pause" variant="line" loading={busy} onPress={onPause} full />
      ) : state === "paused" ? (
        <Button title={busy ? t("pkgSeller.saving") : t("pkgSeller.activate")} icon="power" loading={busy} disabled={!el.eligible} onPress={onResume} full />
      ) : (
        <Button title={busy ? t("pkgSeller.saving") : t("pkgSeller.enable")} icon="play" variant="gradient" loading={busy} disabled={state === "blocked"} onPress={onEnable} full />
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  ic: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  list: { gap: 6 },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  note: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: radius.r },
  why: { flexDirection: "column", alignItems: "stretch", gap: 4 },
});
