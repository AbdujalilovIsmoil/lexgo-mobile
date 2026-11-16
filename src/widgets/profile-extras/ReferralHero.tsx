import { Image, Platform, StyleSheet, View } from "react-native";
import type { Referral } from "@/entities/profile-extras";
import { useShareReferral } from "@/features/profile-extras";
import { Button, Icon, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ReferralCode } from "./ReferralCode";

// The invitation as a white card (Adliya): the gift on a soft tile with the title, the code ticket (copy), the QR when there is one, then
// "Ulashish" and "Nusxalash".
export function ReferralHero({ r }: { r: Referral }) {
  const { t } = useT();
  const { colors: c, dark, glass } = useTheme();
  const { copy, share } = useShareReferral();
  return (
    <View style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      <View style={s.top}>
        <View style={[s.badge, { backgroundColor: c.tint2 }]}><Icon name="gift" size={22} color={c.accent} /></View>
        <View style={s.head}>
          <Text variant="body" weight="bold" style={s.title}>{t("py7.ref.title")}</Text>
          <Text variant="small" tone="gray">{t("py7.ref.sub")}</Text>
        </View>
      </View>
      <ReferralCode code={r.code} onCopy={() => void copy(r.code)} />
      {r.qrUrl ? (
        <View style={s.qrRow}>
          <View style={[s.qrTile, { borderColor: dark || glass ? c.line : "#E6EBF3" }]}><Image source={{ uri: r.qrUrl }} style={s.qr} accessibilityLabel={t("py7.ref.qr")} /></View>
          <Text variant="small" tone="gray" style={s.flex}>{t("py7.ref.qrHint")}</Text>
        </View>
      ) : null}
      <View style={s.row}>
        <Button title={t("py7.ref.share")} icon="share-2" variant="primary" disabled={!r.link} style={s.flex} onPress={() => void share(r.link)} />
        <Button title={t("py7.ref.copyLink")} icon="link" variant="soft" disabled={!r.link} onPress={() => void copy(r.link)} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, gap: 14, borderRadius: 18, borderWidth: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  badge: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  head: { flex: 1, gap: 2 },
  title: { fontSize: 16.5, lineHeight: 22 },
  qrRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  qrTile: { padding: 8, borderRadius: 14, borderWidth: 1, backgroundColor: "#FFFFFF" },
  qr: { width: 96, height: 96 },
  row: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
