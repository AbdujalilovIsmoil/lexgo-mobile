import { StyleSheet, View } from "react-native";
import type { BannerCheck } from "@/entities/promotion";
import { Text } from "@/shared/ui";
import { Notice } from "@/shared/ui/sel";
import { useT } from "@/shared/i18n";

const TONE = { active: "ok", manual_review: "warn", rejected: "err" } as const;

// The server's verdict on the uploaded picture: passed · in manual review · rejected, with its reasons and suggestions.
export function BannerCheckNote({ check }: { check: BannerCheck }) {
  const { t } = useT();
  return (
    <View accessibilityRole="alert" style={s.box}>
      <Notice tone={TONE[check.status]} text={t(`promoSeller.ck.bannerStatus.${check.status}`)} />
      {check.reasons.map((r, i) => <Text key={`r${i}`} variant="small" tone="gray">{`• ${r}`}</Text>)}
      {check.suggestions.length ? <Text variant="small" weight="semibold">{t("promoSeller.ck.bannerSuggest")}</Text> : null}
      {check.suggestions.map((r, i) => <Text key={`s${i}`} variant="small" tone="gray">{`• ${r}`}</Text>)}
    </View>
  );
}

const s = StyleSheet.create({ box: { gap: 4 } });
