import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
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

// A plain page header in the Adliya look (.hdr), pinned above the page on the page's own ground: the back button as a white rounded square
// with a hairline and a soft shadow, the title (display, 20) with an optional line under it, and the support button at the right end.
export function SecondaryHeader({ title, description, right, onBack, hideButton = false, hideLine }: Props) {
  const { colors: c, dark } = useTheme();
  const { t } = useT();
  const insets = useInsets();
  const router = useRouter();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")));
  return (
    <View style={[s.bar, { paddingTop: insets.top, backgroundColor: c.bg, borderBottomColor: c.line }, s.noLine, hideLine ? s.noLine : null]}>
      {hideButton ? null : (
        <PressableScale onPress={back} scale={0.94} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("svc.detail.back")} style={[s.back, dark ? { backgroundColor: c.surface2, borderColor: c.line } : [{ backgroundColor: "#FFFFFF", borderColor: "#E6EBF3" }, s.lift]]}>
          <ChevronLeft size={22} color={c.ink} />
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
  back: { width: 42, height: 42, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  lift: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
  titles: { flex: 1, minWidth: 0, minHeight: 56, justifyContent: "center" },
  title: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
});
