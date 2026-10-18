import { Image, StyleSheet, View } from "react-native";
import { BANNER_MAX_MB } from "@/entities/promotion";
import { radius, useColors } from "@/shared/theme";
import { Button, Input, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { BannerCheckNote } from "./BannerCheckNote";
import { BannerRefs } from "./BannerRefs";
import { bannerErrors } from "./bannerSchema";
import { NO_PICTURE, type Banner } from "./useBannerPick";

type Props = { banner: Banner; required: boolean; onChange: (p: Partial<Banner>) => void; onPick: () => void };

// Banner picture (required or optional by package): the three reference portraits and the rules, a gallery upload with the server's
// check, or an https link; plus optional headline, subtitle and call-to-action.
export function BannerForm({ banner: b, required, onChange, onPick }: Props) {
  const { t } = useT();
  const c = useColors();
  const err = bannerErrors(b);
  const hasFile = !!b.fileName;
  return (
    <SectionCard title={t(required ? "promoSeller.ck.bannerRequired" : "promoSeller.ck.bannerOptional")}>
      <BannerRefs />
      <Text variant="small" tone="gray">{t("promoSeller.ck.bannerRules")}</Text>
      {b.localUri ? <Image source={{ uri: b.localUri }} style={[s.img, { backgroundColor: c.surface2 }]} resizeMode="cover" accessibilityIgnoresInvertColors /> : null}
      <View style={s.row}>
        <Button title={t(b.uploading ? "promoSeller.ck.bannerUploading" : hasFile ? "promoSeller.ck.photoChange" : "promoSeller.ck.bannerPick")} icon="image" variant="soft" size="sm" loading={b.uploading} onPress={onPick} />
        {hasFile && !b.uploading ? <Button title={t("adm.delete")} variant="line" size="sm" onPress={() => onChange(NO_PICTURE)} /> : null}
      </View>
      <Text variant="caption" tone="gray2">{hasFile ? b.fileName : t("promoSeller.ck.bannerNoFile", { mb: BANNER_MAX_MB })}</Text>
      {b.check && hasFile ? <BannerCheckNote check={b.check} /> : null}
      <Text variant="caption" tone="gray2" center>{t("promoSeller.ck.or")}</Text>
      <Input label={t("promoSeller.ck.bannerImageUrl")} value={b.imageUrl} onChangeText={(v) => onChange({ ...NO_PICTURE, imageUrl: v })} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="https://" error={err.imageUrl ? t(err.imageUrl) : undefined} />
      <Input label={t("sl11.banner.headline")} value={b.title} onChangeText={(v) => onChange({ title: v })} maxLength={60} />
      <Input label={t("sl11.banner.subtitle")} value={b.subtitle} onChangeText={(v) => onChange({ subtitle: v })} maxLength={100} />
      <Input label={t("sl11.banner.cta")} value={b.ctaLabel} onChangeText={(v) => onChange({ ctaLabel: v })} maxLength={24} />
      <Input label={t("sl11.banner.ctaUrl")} value={b.ctaUrl} onChangeText={(v) => onChange({ ctaUrl: v })} autoCapitalize="none" keyboardType="url" placeholder="https://" error={err.ctaUrl ? t(err.ctaUrl) : undefined} />
    </SectionCard>
  );
}

const s = StyleSheet.create({ img: { height: 150, borderRadius: radius.r }, row: { flexDirection: "row", gap: 8 } });
