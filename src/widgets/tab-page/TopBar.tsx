import type { ReactNode } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useSession } from "@/entities/session";
import { HEADER_GAP, HEADER_ROW, useInsets } from "@/shared/lib/insets";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { HeaderActions } from "./HeaderActions";

// The row of every page header (same as Home): logo + greeting + name, page tools + support, bell, avatar.
export function TopBar({ right, noActions }: { right?: ReactNode; noActions?: boolean }) {
  const { t } = useT();
  const insets = useInsets();
  const name = useSession()?.user.name;
  return (
    <View style={[s.bar, { paddingTop: insets.top + HEADER_GAP, minHeight: insets.top + HEADER_GAP + HEADER_ROW + 12 }]}>
      <View style={s.brand}>
        <Image source={require("../../../assets/logo-small.png")} style={s.logo} />
        <View style={s.who}>
          <Text variant="caption" tone="gray" numberOfLines={1}>{t("home.greeting")}</Text>
          <Text variant="h4" numberOfLines={1}>{name || t("home.guest")}</Text>
        </View>
      </View>
      <View style={s.tools}>
        {right}
        {noActions ? null : <HeaderActions />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  logo: { width: 40, height: 40, borderRadius: 12 },
  who: { flex: 1, minWidth: 0 },
  tools: { flexDirection: "row", alignItems: "center", gap: 8 },
});
