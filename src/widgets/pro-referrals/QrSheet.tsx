import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { API_BASE } from "@/shared/config/env";
import { useT } from "@/shared/i18n";
import { downloadAndShare } from "@/shared/lib/files";
import { successHaptic } from "@/shared/lib/haptics";
import { radius } from "@/shared/theme";
import { BottomSheet, Button, Text, toast } from "@/shared/ui";

// QR (public PNG from the API) in a bottom sheet; the button hands the image to the system share / save sheet.
export function QrSheet({ visible, onClose, qrPath, code }: { visible: boolean; onClose: () => void; qrPath: string; code: string }) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const uri = qrPath ? `${API_BASE}${qrPath.startsWith("/") ? "" : "/"}${qrPath}` : "";
  const save = async () => {
    if (!qrPath) return;
    setBusy(true);
    try {
      await downloadAndShare(qrPath, `lexgo-${code || "invite"}.png`, "image/png");
      successHaptic();
    } catch {
      toast(t("refUx.qrFail"), "err");
    } finally {
      setBusy(false);
    }
  };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("refUx.qrSheet")} snaps={[0.62]}>
      <View style={s.body}>
        {uri ? (
          <View style={s.frame}>
            <Image source={{ uri }} style={s.img} resizeMode="contain" accessibilityLabel={t("refUx.qr")} />
          </View>
        ) : (
          <Text variant="small" tone="gray" center>{t("refUx.qrMissing")}</Text>
        )}
        <Text variant="small" tone="gray" center>{t("refUx.qrHint")}</Text>
        <Button title={t("refUx.qrSave")} icon="download" full loading={busy} disabled={!uri} onPress={() => void save()} />
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, gap: 16, alignItems: "stretch" },
  frame: { alignSelf: "center", padding: 14, borderRadius: radius.rl, backgroundColor: "#FFFFFF" },
  img: { width: 220, height: 220 },
});
