import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useModuleGroups } from "@/widgets/admin-drawer";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { EmptyState } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { GroupSection } from "./ui/GroupSection";
import { HubHeader } from "./ui/HubHeader";
import { RecentRail } from "./ui/RecentRail";

// Staff tab: a launcher of every admin section this user may open — recent ones first, then the web sidebar's groups as tiles.
export function AdminHubPage() {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const [q, setQ] = useState("");
  const all = useModuleGroups();
  const groups = useModuleGroups(q);
  const total = all.reduce((n, g) => n + g.mods.length, 0);
  const visible = new Set(all.flatMap((g) => g.mods.map((m) => m.key)));
  let offset = 0;
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 130 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <HubHeader sections={total} />
      <View style={s.search}><SearchBox value={q} onChangeText={setQ} placeholder={t("admHub.search")} /></View>
      {q.trim() ? null : <RecentRail visible={visible} />}
      {groups.length ? groups.map((g) => { const o = offset; offset += g.mods.length; return <GroupSection key={g.key} group={g} offset={o} />; }) : <EmptyState icon="lock" title={t("admHub.empty")} />}
    </ScrollView>
  );
}

const s = StyleSheet.create({ body: { gap: 14 }, search: { marginTop: 2 } });
