import { Image, StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The backend's public QR PNG on a white tile (so it scans on the dark hero), with its hint beside it.
export function ReferralQr({ uri }: { uri: string }) {
  const { t } = useT();
  return (
    <View style={s.wrap}>
      <View style={s.tile}><Image source={{ uri }} style={s.qr} accessibilityLabel={t("py7.ref.qr")} /></View>
      <Text variant="small" style={s.hint}>{t("py7.ref.qrHint")}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 14 },
  tile: { padding: 8, borderRadius: 16, backgroundColor: "#FFFFFF" },
  qr: { width: 96, height: 96 },
  hint: { flex: 1, color: "#C4DEFF" },
});
