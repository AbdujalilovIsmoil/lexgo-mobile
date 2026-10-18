import { useState } from "react";
import { Image, ScrollView, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { fitPicture } from "@/entities/promotion";
import { radius, useColors } from "@/shared/theme";
import { BottomSheet, Button, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The three portraits of the web checkout (served at /promotions/banner-reference-images/<name>), bundled with the app.
const REFS = [
  { name: "close-professional", src: require("../../../assets/promo/close-professional.jpg"), large: require("../../../assets/promo/close-professional-lg.jpg") },
  { name: "balanced-professional", src: require("../../../assets/promo/balanced-professional.jpg"), large: require("../../../assets/promo/balanced-professional-lg.jpg") },
  { name: "environmental-professional", src: require("../../../assets/promo/environmental-professional.jpg"), large: require("../../../assets/promo/environmental-professional-lg.jpg") },
] as const;

// «Rasm shunday bo'lishi kerak»: three portrait examples with captions; a tap shows one larger.
export function BannerRefs() {
  const { t } = useT();
  const c = useColors();
  const [big, setBig] = useState<(typeof REFS)[number] | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const fit = fitPicture(box.w, box.h); // the area left by the sheet, measured, then the 4:5 portrait fitted in it
  const measure = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  return (
    <View style={s.box}>
      <Text variant="small" weight="semibold">{t("promoSeller.ck.bannerRefsLead")}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {REFS.map((r) => (
          <PressableScale key={r.name} onPress={() => setBig(r)} accessibilityRole="imagebutton" accessibilityLabel={`${t(`promoSeller.ck.bannerRef.${r.name}`)}. ${t("promoSeller.ck.photoOpen")}`} style={s.item}>
            <View style={[s.thumb, { backgroundColor: c.surface2 }]}><Image source={r.src} style={s.img} resizeMode="cover" accessibilityIgnoresInvertColors /></View>
            <Text variant="caption" tone="gray" center numberOfLines={2}>{t(`promoSeller.ck.bannerRef.${r.name}`)}</Text>
          </PressableScale>
        ))}
      </ScrollView>
      <BottomSheet visible={!!big} onClose={() => setBig(null)} title={big ? t(`promoSeller.ck.bannerRef.${big.name}`) : undefined} snaps={[0.88]}>
        <View style={s.viewer}>
          <View style={s.stage} onLayout={measure}>
            {big && fit.width > 0 ? <Image source={big.large} style={[{ width: fit.width, height: fit.height, backgroundColor: c.surface2 }, s.photo]} resizeMode="contain" accessibilityLabel={t(`promoSeller.ck.bannerRef.${big.name}`)} accessibilityIgnoresInvertColors /> : null}
          </View>
          <Button title={t("promoSeller.ck.viewerClose")} variant="line" full onPress={() => setBig(null)} />
        </View>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  box: { gap: 8 },
  row: { gap: 10 },
  item: { width: 104, gap: 6 },
  thumb: { width: 104, height: 130, borderRadius: radius.r, overflow: "hidden" }, // 4:5 like the 512x640 originals
  img: { width: "100%", height: "100%" },
  viewer: { flex: 1, padding: 16, gap: 12 },
  stage: { flex: 1, alignItems: "center", justifyContent: "center" },
  photo: { borderRadius: radius.r },
});
