import { Image, StyleSheet, View } from "react-native";
import { isBannerUrl, type Placement } from "@/entities/promotion";
import { useColors } from "@/shared/theme";
import { Avatar, GradientBox, Pill, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { Banner } from "./useBannerPick";

type Props = { placement: Placement; name: string; avatarUrl: string; serviceTitle: string; banner: Banner; label: string };

// What clients will see, drawn before anything is paid for: the top banner, a boosted profile card in the
// marketplace list, or a sponsored service in the category search (TZ 20: placement preview before checkout).
export function PlacementPreview({ placement, name, avatarUrl, serviceTitle, banner: b, label }: Props) {
  const { t } = useT();
  const c = useColors();
  const pic = b.localUri || (isBannerUrl(b.imageUrl) ? b.imageUrl.trim() : "");
  const who = name || t("promoSeller.ck.previewSeller");
  return (
    <SectionCard title={t("sl11.preview.title")}>
      {placement === "banner" ? (
        <GradientBox variant="dark" round={18} style={s.banner}>
          {pic ? <Image source={{ uri: pic }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
          <View style={[s.shade, { backgroundColor: pic ? "rgba(2,10,28,0.45)" : "transparent" }]}>
            <Pill label={t("sl11.preview.ad")} tone="glass" small />
            <Text variant="h4" tone="white" numberOfLines={2}>{b.title || who}</Text>
            <Text variant="small" tone="white" numberOfLines={2}>{b.subtitle || t("sl11.preview.bannerSub")}</Text>
            <Pill label={b.ctaLabel || t("promoSeller.ck.previewCta")} tone="ok" small />
          </View>
        </GradientBox>
      ) : (
        <View style={[s.card, { borderColor: c.accent, backgroundColor: c.surface }]}>
          <Avatar name={who} uri={avatarUrl || undefined} size={46} />
          <View style={s.col}>
            <View style={s.row}>
              <Text variant="body" weight="bold" numberOfLines={1} style={s.col}>{placement === "service_boost" ? serviceTitle : who}</Text>
              <Pill label={placement === "service_boost" ? t("sl11.preview.sponsored") : t("promoSeller.ck.previewTop")} tone="cy" small />
            </View>
            <Text variant="caption" tone="gray" numberOfLines={1}>{placement === "service_boost" ? who : label || t("sl11.preview.recommended")}</Text>
          </View>
        </View>
      )}
      {placement === "banner" && !pic ? <Text variant="caption" tone="gray2">{t("promoSeller.ck.previewBannerNoImage")}</Text> : null}
      <Text variant="caption" tone="gray2">{t(`sl11.preview.where.${placement}`)}</Text>
    </SectionCard>
  );
}

const s = StyleSheet.create({
  banner: { minHeight: 150 },
  shade: { flex: 1, padding: 16, gap: 6, justifyContent: "flex-end", alignItems: "flex-start" },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 2 },
  col: { flex: 1, gap: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
