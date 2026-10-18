import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { IconButton } from "../IconButton";
import { Text } from "../Text";
import { HeaderExtra, HeaderRight } from "../headerExtra";

type Props = { hideBack?: boolean; title: string; subtitle?: string; onBack?: () => void; right?: ReactNode; footer?: ReactNode; children: ReactNode };

// Frame of every admin screen: back button, title (+ optional subtitle), a row of
// header actions, the body, and an optional sticky footer above the home indicator.
export function AdminPage({ hideBack, title, subtitle, onBack, right, footer, children }: Props) {
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")));
  return (
    <View style={[s.fill, { backgroundColor: c.bg }]}>
      <View style={[s.bar, { paddingTop: insets.top + 6 }]}>
        {hideBack ? null : <IconButton icon="chevron-left" onPress={back} />}
        <View style={s.titles}>
          <Text variant="h4" numberOfLines={1}>{title}</Text>
          {subtitle ? <Text variant="caption" tone="gray" numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        <View style={s.right}>{right ?? <HeaderRight />}</View>
      </View>
      <HeaderExtra />
      <View style={s.fill}>{children}</View>
      {footer ? <View style={[s.footer, { borderTopColor: c.line, backgroundColor: c.bg, paddingBottom: insets.bottom + 10 }]}>{footer}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  titles: { flex: 1, gap: 1 },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  footer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
});
