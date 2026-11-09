import { StyleSheet, View } from "react-native";
import { GradientBox, Text, FocusStatusBar } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The top of Home under the fixed bar (DashTopBar, whose height is `top`): the one question. Its bottom edge runs under the middle of the ask field (DashAsk, placed
// right after it with a negative margin), so the field sits half on the hero, half on the page.
// Light theme: the hero itself is see-through — the blue is DashBackdrop, which fades into the page with no edge. The dark and the
// glass themes keep the dark rounded hero.
export function DashHero({ top }: { top: number }) {
  const { t } = useT();
  const { dark } = useTheme();
  const content = (
    <>
      <FocusStatusBar style="light" />
      <Text variant="h2" tone="white" style={s.title}>{t("cdash.home.title")}</Text>
    </>
  );
  const pad = { paddingTop: top + TITLE_GAP };
  return dark ? (
    <GradientBox variant="dark" round={0} style={[s.hero, s.rounded, pad]}>{content}</GradientBox>
  ) : (
    <View style={[s.hero, pad]}>{content}</View>
  );
}

export const HERO_OVERLAP = 28;
const TITLE_GAP = 8; // with the bar's own 8 below its row: the 16 the title always had under the row

const s = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: HERO_OVERLAP + 16 },
  rounded: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  title: { fontSize: 27, lineHeight: 32 },
});
