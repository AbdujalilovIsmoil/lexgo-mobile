import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
// import { MenuButton } from "@/widgets/client-sidebar/MenuButton"; // the drawer button is off on Home for now (UserButton in its place)
import { HeaderActions } from "@/widgets/tab-page";
import { UserButton } from "./UserButton";

// The user's photo (UserButton; the menu button is commented out for now) + greeting on the left; on the right the very same round buttons as every other page header (support, bell,
// avatar) with the same sizes and gaps, so nothing moves when you switch between Home and the other tabs.
// `onWhite`: the row stands on a white ground (Home scrolled), so it takes the dark type and the plain buttons of the other tabs.
export function HeroTopRow({ name, onWhite }: { name?: string; onWhite?: boolean }) {
  const { t } = useT();
  return (
    <View style={s.row}>
      <View style={s.brand}>
        {/* <MenuButton glass={!onWhite} /> */}
        <UserButton onWhite={onWhite} />
        <View style={s.who}>
          <Text variant="caption" tone="gray" style={onWhite ? undefined : s.hi} numberOfLines={1}>
            {t("home.greeting")}
          </Text>
          <Text variant="h4" tone={onWhite ? "ink" : "white"} numberOfLines={1}>
            {name || t("home.guest")}
          </Text>
        </View>
      </View>
      <HeaderActions glass={!onWhite} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 44 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  who: { flex: 1, minWidth: 0 },
  hi: { color: "#AFC0E0" },
});
