import * as Clipboard from "expo-clipboard";
import { Image, Share, StyleSheet, View } from "react-native";
import type { Referral } from "@/entities/pro-referrals";
import { API_BASE } from "@/shared/config/env";
import { useT } from "@/shared/i18n";
import { Button, Card, Text, toast } from "@/shared/ui";

// Referral code + link with copy / share buttons and the QR image (public PNG from the API).
export function CodeCard({ r }: { r: Referral }) {
  const { t } = useT();
  const copy = (v: string) => void Clipboard.setStringAsync(v).then(() => toast(t("adm.copied"), "ok"));
  const qr = r.qrPath ? `${API_BASE}${r.qrPath.startsWith("/") ? "" : "/"}${r.qrPath}` : "";
  return (
    <Card style={s.card}>
      <Text variant="caption" tone="gray">{t("aw10.code")}</Text>
      <Text variant="h2" selectable>{r.code || "—"}</Text>
      <View style={s.row}>
        <Button title={t("aw10.copy")} icon="copy" size="sm" variant="soft" disabled={!r.code} onPress={() => copy(r.code)} />
        <Button title={t("aw10.share")} icon="share-2" size="sm" disabled={!r.link} onPress={() => void Share.share({ message: `${t("aw10.shareText")} ${r.link}` })} />
      </View>
      {r.link ? <Text variant="caption" tone="gray" numberOfLines={2} selectable onPress={() => copy(r.link)}>{r.link}</Text> : null}
      {qr ? (
        <View style={s.qr}>
          <Image source={{ uri: qr }} style={s.img} resizeMode="contain" accessibilityLabel="QR" />
          <Text variant="caption" tone="gray" center>{t("aw10.qrHint")}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { gap: 10, alignItems: "flex-start" },
  row: { flexDirection: "row", gap: 8 },
  qr: { alignSelf: "center", alignItems: "center", gap: 6, marginTop: 6 },
  img: { width: 160, height: 160, borderRadius: 12, backgroundColor: "#fff" },
});
