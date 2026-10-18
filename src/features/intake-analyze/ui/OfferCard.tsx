import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { IntakeOffer } from "@/entities/intake";
import { PassportFacts, useServicePassport } from "@/entities/service";
import { fmtMoney } from "@/shared/lib/money";
import { Button, Card, Icon, Pill, Skeleton, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";

// A matched service level: price, term / documents / advocate-only facts, the passport on demand, "Buyurtma berish".
export function OfferCard({ offer: o }: { offer: IntakeOffer }) {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const passport = useServicePassport(open ? o.serviceId : "");
  const lvl = t(`cxIn.levels.${o.level}`);
  return (
    <Card tinted style={s.card}>
      <Pill label={lvl.startsWith("cxIn.") ? o.level : lvl} small />
      <Text variant="body" weight="bold">{o.title}</Text>
      <Text variant="h4" tone="accent">{o.price ? `${fmtMoney(o.price)} ${t("cxIn.som")}` : t("cxIn.byRequest")}</Text>
      <View style={s.meta}>
        {o.days ? <View style={s.item}><Icon name="clock" size={13} color={c.gray} /><Text variant="caption" tone="gray">{t("cxIn.termDays", { n: o.days })}</Text></View> : null}
        {o.docsCount ? <View style={s.item}><Icon name="file-text" size={13} color={c.gray} /><Text variant="caption" tone="gray">{t("cxIn.docsN", { n: o.docsCount })}</Text></View> : null}
        {o.advokatRequired ? <View style={s.item}><Icon name="shield" size={13} color={c.gray} /><Text variant="caption" tone="gray">{t("cxIn.advokatOnly")}</Text></View> : null}
      </View>
      {open ? (passport.data ? <PassportFacts service={passport.data.service} passport={passport.data.passport} /> : passport.isError ? null : <Skeleton height={60} />) : null}
      <View style={s.acts}>
        <Button title={open ? t("cxIn.hidePassport") : t("cxIn.showPassport")} variant="line" size="sm" onPress={() => setOpen(!open)} />
        <Button title={t("cxIn.orderOffer")} size="sm" icon="arrow-right" iconRight onPress={() => router.push({ pathname: "/services/[id]", params: { id: o.serviceId } })} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 8 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  item: { flexDirection: "row", alignItems: "center", gap: 4 },
  acts: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
