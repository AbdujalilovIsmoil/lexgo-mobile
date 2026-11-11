import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useInsets } from "@/shared/lib/insets";
import { fonts, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { HeaderRight } from "./headerExtra";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

type Props = {
  title: string;
  description?: string;
  /** Replaces the support button at the right end. */
  right?: ReactNode;
  /** Defaults to going back, or to Home when there is nothing to go back to. */
  onBack?: () => void;
  /** No back button: a tab's own page has nothing to go back to. */
  hideButton?: boolean;
  hideLine?: boolean;
};

// Light theme back button: the page's grey ground (HOME_BG), the same on iOS and Android (Android's surface2 is a blue tone).
const BACK_LIGHT = "#F2F4F7";

// A plain page header, pinned above the page: the back button, the title with an optional line under it, and the support button at the right end.
export function SecondaryHeader({ title, description, right, onBack, hideButton = false, hideLine }: Props) {
  const { colors: c, dark } = useTheme();
  const { t } = useT();
  const insets = useInsets();
  const router = useRouter();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")));
  return (
    <View style={[s.bar, { paddingTop: insets.top, backgroundColor: c.surface, borderBottomColor: c.line }, hideLine ? s.noLine : null]}>
      {hideButton ? null : (
        <PressableScale onPress={back} scale={0.94} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("svc.detail.back")} style={[s.back, { backgroundColor: dark ? c.tint2 : BACK_LIGHT }]}>
          {/* Dark theme: the same blue tint and icon colour as the support button at the right end. */}
          <ChevronLeft size={22} color={dark ? c.accent : c.ink} />
        </PressableScale>
      )}
      <View style={s.titles}>
        <Text variant="h4" numberOfLines={1} style={s.title}>{title}</Text>
        {description ? <Text variant="caption" tone="gray" numberOfLines={1}>{description}</Text> : null}
      </View>
      {right ?? <HeaderRight />}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  noLine: { borderBottomWidth: 0 },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  titles: { flex: 1, minWidth: 0, minHeight: 56, justifyContent: "center" },
  title: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22 },
});
