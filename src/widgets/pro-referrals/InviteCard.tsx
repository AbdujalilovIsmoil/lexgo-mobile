import * as Clipboard from "expo-clipboard";
import { Platform, Share, StyleSheet, View } from "react-native";
import type { Referral } from "@/entities/pro-referrals";
import { shareMessage } from "@/entities/pro-referrals";
import { useT } from "@/shared/i18n";
import { successHaptic } from "@/shared/lib/haptics";
import { radius, shadows } from "@/shared/theme";
import { GradientBox, Icon, PressableScale, Text, toast } from "@/shared/ui";

const MONO = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

// Hero of the screen: the code in big mono letters, copy, native share and the QR round button.
export function InviteCard({ r, onQr }: { r: Referral; onQr: () => void }) {
  const { t } = useT();
  const has = !!r.code;
  const copy = () => {
    if (!has) return;
    void Clipboard.setStringAsync(r.code).then(() => {
      successHaptic();
      toast(t("refUx.copied"), "ok");
    });
  };
  const share = () => void Share.share({ message: shareMessage(t("aw10.shareText"), r.code, r.link) }).catch(() => {});
  return (
    <GradientBox variant="primary" round={radius.rx} style={s.card}>
      <Text variant="small" style={s.dim}>{t("refUx.inviteTitle")}</Text>
      <View style={s.codeRow}>
        <Text style={s.code} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} accessibilityLabel={`${t("refUx.inviteTitle")}: ${r.code.split("").join(" ")}`}>{r.code || "—"}</Text>
        <PressableScale onPress={copy} disabled={!has} accessibilityLabel={t("refUx.copyLabel")} style={[s.round, s.glass, !has && s.off]}>
          <Icon name="copy" size={20} tone="white" />
        </PressableScale>
      </View>
      <View style={s.actions}>
        <PressableScale onPress={share} disabled={!r.link && !has} accessibilityLabel={t("refUx.shareLabel")} style={[s.share, shadows.s2, !r.link && !has && s.off]}>
          <Icon name="share-2" size={18} color="#1668F0" />
          <Text variant="body" weight="semibold" style={s.shareTxt} numberOfLines={1}>{t("refUx.share")}</Text>
        </PressableScale>
        <PressableScale onPress={onQr} accessibilityLabel={t("refUx.qrOpen")} style={[s.round, s.glass]}>
          <Icon name="grid" size={20} tone="white" />
        </PressableScale>
      </View>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  card: { padding: 20, gap: 14 },
  dim: { color: "rgba(255,255,255,0.8)" },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  code: { flex: 1, color: "#FFFFFF", fontFamily: MONO, fontSize: 34, lineHeight: 42, fontWeight: "700", letterSpacing: 3 },
  actions: { flexDirection: "row", alignItems: "center", gap: 12 },
  share: { flex: 1, minHeight: 48, borderRadius: radius.pill, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 20 },
  shareTxt: { color: "#1668F0" },
  round: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  glass: { backgroundColor: "rgba(255,255,255,0.18)" },
  off: { opacity: 0.5 },
});
