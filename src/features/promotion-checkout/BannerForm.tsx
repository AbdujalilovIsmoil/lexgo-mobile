import { Image, StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Button, Input } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { bannerErrors } from "./bannerSchema";
import type { Banner } from "./useBannerPick";

type Props = { banner: Banner; onChange: (p: Partial<Banner>) => void; busy: boolean; onPick: () => void };

// Optional banner content: picture (uploaded) or https link, headline, subtitle, call-to-action. Only https links are accepted (TZ 40).
export function BannerForm({ banner: b, onChange, busy, onPick }: Props) {
  const { t } = useT();
  const c = useColors();
  const err = bannerErrors(b);
  const shown = b.localUri || b.imageUrl;
  return (
    <SectionCard title={t("sl11.banner.title")}>
      {shown ? <Image source={{ uri: shown }} style={[s.img, { backgroundColor: c.surface2 }]} resizeMode="cover" /> : null}
      <View style={s.row}>
        <Button title={t(shown ? "sl11.banner.change" : "sl11.banner.pick")} icon="image" variant="soft" size="sm" loading={busy} onPress={onPick} />
        {shown ? <Button title={t("adm.delete")} variant="line" size="sm" onPress={() => onChange({ fileUrl: "", localUri: "", imageUrl: "" })} /> : null}
      </View>
      <Input label={t("sl11.banner.link")} value={b.imageUrl} onChangeText={(v) => onChange({ imageUrl: v, fileUrl: "", localUri: "" })} autoCapitalize="none" keyboardType="url" placeholder="https://" error={err.imageUrl ? t(err.imageUrl) : undefined} />
      <Input label={t("sl11.banner.headline")} value={b.title} onChangeText={(v) => onChange({ title: v })} maxLength={60} />
      <Input label={t("sl11.banner.subtitle")} value={b.subtitle} onChangeText={(v) => onChange({ subtitle: v })} maxLength={100} />
      <Input label={t("sl11.banner.cta")} value={b.ctaLabel} onChangeText={(v) => onChange({ ctaLabel: v })} maxLength={24} />
      <Input label={t("sl11.banner.ctaUrl")} value={b.ctaUrl} onChangeText={(v) => onChange({ ctaUrl: v })} autoCapitalize="none" keyboardType="url" placeholder="https://" error={err.ctaUrl ? t(err.ctaUrl) : undefined} />
    </SectionCard>
  );
}

const s = StyleSheet.create({ img: { height: 150, borderRadius: 14 }, row: { flexDirection: "row", gap: 8 } });
