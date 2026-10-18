import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSession } from "@/entities/session";
import { Avatar, EmptyState, IconButton, PressableScale, Text } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useModuleGroups } from "../model/useModuleGroups";
import { useModuleNav } from "../model/useModuleNav";
import { DrawerItem } from "./DrawerItem";

// The module switcher: who is signed in, a search box and every module the user may open, grouped like the hub.
export function DrawerPanel({ onClose }: { onClose?: () => void }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const user = useSession()?.user;
  const [q, setQ] = useState("");
  const groups = useModuleGroups(q);
  const { current, go, hub } = useModuleNav();
  const total = groups.reduce((n, g) => n + g.mods.length, 0);
  return (
    <View style={[s.fill, { backgroundColor: c.surface, paddingTop: insets.top + 8 }]}>
      <View style={s.head}>
        <Avatar name={user?.name ?? "?"} size={40} />
        <View style={s.col}>
          <Text variant="body" weight="bold" numberOfLines={1}>{user?.name}</Text>
          <Text variant="caption" tone="gray">{t("ag1.drawer.count", { n: total })}</Text>
        </View>
        {onClose ? <IconButton icon="x" size={38} onPress={onClose} label={t("ag1.drawer.close")} /> : null}
      </View>
      <View style={s.search}><SearchBox value={q} onChangeText={setQ} placeholder={t("ag1.drawer.search")} /></View>
      <ScrollView contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <PressableScale onPress={hub} style={s.hub}><Text variant="small" weight="bold" tone="accent">‹  {t("ag1.drawer.hub")}</Text></PressableScale>
        {groups.length ? groups.map((g) => (
          <View key={g.key} style={s.group}>
            <Text variant="kicker" tone="gray2" style={s.kicker}>{t(`admHub.groups.${g.key}`).toUpperCase()}</Text>
            {g.mods.map((m) => <DrawerItem key={m.key} mod={m} active={m.key === current} onPress={() => go(m.key)} />)}
          </View>
        )) : <EmptyState icon="search" title={t("ag1.drawer.none")} />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  col: { flex: 1, gap: 1 },
  search: { marginHorizontal: -0, paddingBottom: 6 },
  list: { paddingHorizontal: 10, gap: 14, paddingTop: 6 },
  hub: { paddingHorizontal: 10, paddingVertical: 6 },
  group: { gap: 2 },
  kicker: { marginLeft: 10, marginBottom: 4 },
});
