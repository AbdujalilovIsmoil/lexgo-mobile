import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Icon, Pill, Text, type PillTone } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import { hiddenReasons } from "../lib/hidden";
import { outOfBand } from "../lib/band";
import type { ManagedService } from "../model/serviceTypes";

const TONE: Record<string, PillTone> = { active: "ok", paused: "warn", inactive: "gray" };

// One service of a member: status, price against the allowed range, visibility, promotion; `children` = actions.
export function ServiceCard({ item: i, verified, children }: { item: ManagedService; verified: boolean; children?: ReactNode }) {
  const c = useColors();
  const { t } = useT();
  const off = outOfBand(i.selectedPrice, i.band);
  const why = hiddenReasons(i, verified).map((r) => t(`og5.reasons.${r}`)).join(", ");
  return (
    <Card style={s.card}>
      <View style={s.top}>
        <Text variant="caption" tone="gray" numberOfLines={1} style={s.flex}>{i.category || t("og5.service")}</Text>
        <Pill label={t(`og5.status.${i.status}`)} tone={TONE[i.status]} small />
      </View>
      <Text variant="body" weight="bold" numberOfLines={3}>{i.name}</Text>
      <View style={s.price}>
        <Text variant="h3">{fmtMoney(i.effectivePrice)}</Text>
        <Text variant="small" tone="gray">{t("adm.currency")}</Text>
        {!i.selectedPrice ? <Pill label={t("og5.catalogPrice")} tone="gray" small /> : null}
        {i.promotedDays > 0 ? <Pill label={t("og5.promoted", { days: i.promotedDays })} tone="blue" icon="zap" small /> : i.promoRequest ? <Pill label={t("og5.promoWait")} tone="warn" icon="clock" small /> : null}
      </View>
      {i.band ? <Text variant="caption" style={{ color: off ? c.err : c.gray }}>{t(off ? "og5.bandOff" : "og5.band", { min: fmtMoney(i.band.min), max: fmtMoney(i.band.max) })}</Text> : null}
      {i.note ? <Text variant="small" tone="gray" numberOfLines={3}>{i.note}</Text> : null}
      <View style={s.vis}>
        <Icon name={i.visible ? "eye" : "eye-off"} size={14} color={i.visible ? c.ok : c.gray2} />
        <Text variant="caption" tone={i.visible ? "ok" : "gray"} style={s.flex}>{i.visible ? t("og5.visible") : t("og5.hidden", { reasons: why })}</Text>
      </View>
      {children}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 8 },
  flex: { flex: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  price: { flexDirection: "row", alignItems: "baseline", gap: 6, flexWrap: "wrap" },
  vis: { flexDirection: "row", alignItems: "center", gap: 6 },
});
