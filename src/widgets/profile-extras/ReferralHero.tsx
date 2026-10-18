import { StyleSheet, View } from "react-native";
import type { Referral } from "@/entities/profile-extras";
import { useShareReferral } from "@/features/profile-extras";
import { Button, GradientBox, Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ReferralCode } from "./ReferralCode";
import { ReferralQr } from "./ReferralQr";

// The invitation on a dark gradient card: title, code ticket, share / copy link and the QR.
export function ReferralHero({ r }: { r: Referral }) {
  const { t } = useT();
  const { copy, share } = useShareReferral();
  return (
    <GradientBox variant="dark" round={24} style={s.card}>
      <View style={s.glow} pointerEvents="none" />
      <View style={s.top}>
        <View style={s.badge}><Icon name="gift" size={24} color="#00CFE8" /></View>
        <View style={s.head}>
          <Text variant="h3" tone="white">{t("py7.ref.title")}</Text>
          <Text variant="small" style={s.sub}>{t("py7.ref.sub")}</Text>
        </View>
      </View>
      <ReferralCode code={r.code} onCopy={() => void copy(r.code)} />
      {r.qrUrl ? <ReferralQr uri={r.qrUrl} /> : null}
      <View style={s.row}>
        <Button title={t("py7.ref.share")} icon="share-2" variant="gradient" disabled={!r.link} style={s.flex} onPress={() => void share(r.link)} />
        <Button title={t("py7.ref.copyLink")} icon="link" variant="glass" disabled={!r.link} onPress={() => void copy(r.link)} />
      </View>
          </GradientBox>
  );
}

const s = StyleSheet.create({
  card: { padding: 18, gap: 14 },
  glow: { position: "absolute", top: -90, right: -70, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(0,207,232,0.2)" },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  badge: { width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  head: { flex: 1, gap: 2 },
  sub: { color: "#C4DEFF" },
  row: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
});
