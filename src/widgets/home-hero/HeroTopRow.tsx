import { StyleSheet, View } from "react-native";
import { Text, BrandLogo } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { HeaderActions } from "@/widgets/tab-page";

// Logo + greeting on the left; on the right the very same round buttons as every other page header (demo, support, bell,
// avatar) with the same sizes and gaps, so nothing moves when you switch between Home and the other tabs.
export function HeroTopRow({ name }: { name?: string }) {
  const { t } = useT();
  return (
    <View style={s.row}>
      <View style={s.brand}>
        <BrandLogo size={40} />
        <View style={s.who}>
          <Text variant="caption" style={s.hi} numberOfLines={1}>
            {t("home.greeting")}
          </Text>
          <Text variant="h4" tone="white" numberOfLines={1}>
            {name || t("home.guest")}
          </Text>
        </View>
      </View>
      <HeaderActions glass />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 44 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  who: { flex: 1, minWidth: 0 },
  hi: { color: "#93C6FF" },
});
