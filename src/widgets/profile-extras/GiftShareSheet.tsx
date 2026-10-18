import { Image, Share, StyleSheet, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { PaymentPendingCard } from "@/features/payments";
import { FormSheet } from "@/shared/ui/admin";
import { Button, Icon, Pill, PressableScale, Text, toast } from "@/shared/ui";
import { useKept } from "@/shared/lib";
import { selectHaptic } from "@/shared/lib/haptics";
import { tOr } from "@/shared/lib/pay/tOr";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

export type ShareView = { title: string; code: string; shareUrl: string; qrUrl: string; status: string; paymentId?: string; paymentUrl?: string; fresh?: boolean };

// A gift as a ticket: status, the QR on a white tile, the code (tap = copy) and two short actions — share, copy the link.
// Right after creating it, the payment the backend is settling is shown on top.
export function GiftShareSheet({ view, onClose }: { view: ShareView | null; onClose: () => void }) {
  const { t } = useT();
  const c = useColors();
  const kept = useKept(view);
  const v = view ?? kept;
  const copy = async (text: string) => {
    selectHaptic();
    await Clipboard.setStringAsync(text);
    toast(t("adm.copied"), "ok");
  };
  return (
    <FormSheet visible={!!view} onClose={onClose} title={v?.fresh ? t("py8.share.ready") : v?.title || t("py8.untitled")} subtitle={v?.fresh ? t("py8.share.hint") : undefined} submitLabel={t("py8.done")} onSubmit={onClose}>
      {v ? (
        <View style={s.col}>
          {v.paymentId ? <PaymentPendingCard paymentId={v.paymentId} paymentUrl={v.paymentUrl} /> : <View style={s.center}><Pill label={tOr(t, "py8.status", v.status)} tone="cy" /></View>}
          {v.qrUrl ? <View style={s.tile}><Image source={{ uri: v.qrUrl }} style={s.qr} accessibilityLabel={t("py8.share.qr")} /></View> : null}
          {v.code ? (
            <PressableScale onPress={() => void copy(v.code)} accessibilityRole="button" accessibilityLabel={t("adm.copy")} style={[s.ticket, { borderColor: c.accent, backgroundColor: c.tint }]}>
              <Text variant="caption" tone="gray">{t("gfx.code")}</Text>
              <View style={s.codeRow}><Text variant="h2" selectable numberOfLines={1} adjustsFontSizeToFit style={s.code}>{v.code}</Text><Icon name="copy" size={20} tone="accent" /></View>
              <Text variant="caption" tone="gray2">{t("gfx.tap")}</Text>
            </PressableScale>
          ) : null}
          {v.shareUrl ? (
            <View style={s.row}>
              <Button title={t("py8.share.share")} icon="share-2" variant="gradient" style={s.flex} onPress={() => void Share.share({ message: v.shareUrl, url: v.shareUrl }).catch(() => undefined)} />
              <Button title={t("py8.share.copyLink")} icon="link" variant="line" style={s.flex} onPress={() => void copy(v.shareUrl)} />
            </View>
          ) : null}
        </View>
      ) : null}
    </FormSheet>
  );
}

const s = StyleSheet.create({
  col: { gap: 16, alignItems: "stretch" },
  center: { alignItems: "center" },
  row: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  tile: { alignSelf: "center", padding: 12, borderRadius: radius.rl, backgroundColor: "#FFFFFF" },
  qr: { width: 176, height: 176 },
  ticket: { alignItems: "center", gap: 4, paddingVertical: 14, paddingHorizontal: 16, borderRadius: radius.rl, borderWidth: 1.5, borderStyle: "dashed" },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  code: { letterSpacing: 3, maxWidth: "85%" },
});
