import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { displayName, useSession } from "@/entities/session";
import { HEADER_GAP, HEADER_ROW, useInsets } from "@/shared/lib/insets";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { MenuButton } from "@/widgets/client-sidebar/MenuButton";
import { HeaderActions } from "./HeaderActions";

// The row of every page header (same as Home): menu button + greeting + name, page tools + support, bell, avatar.
export function TopBar({ right, noActions }: { right?: ReactNode; noActions?: boolean }) {
  const { t } = useT();
  const insets = useInsets();
  const name = displayName(useSession()?.user);
  return (
    <View style={[s.bar, { paddingTop: insets.top + HEADER_GAP, minHeight: insets.top + HEADER_GAP + HEADER_ROW + 12 }]}>
      <View style={s.brand}>
        <MenuButton />
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
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  who: { flex: 1, minWidth: 0 },
  tools: { flexDirection: "row", alignItems: "center", gap: 8 },
});
