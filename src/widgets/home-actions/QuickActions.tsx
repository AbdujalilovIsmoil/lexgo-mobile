import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { moduleByKey, useAccess } from "@/entities/access";
import { useIsAuthed } from "@/entities/session";
import { SectionHeader } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ACTIONS } from "./actions";
import { ActionTile } from "./ActionTile";
import { ADMIN_SHORTCUTS, adminAction } from "./adminActions";

// TZ 7: the quick actions of the dashboard as one swipeable rail. A visitor sees only those that work signed out.
export function QuickActions() {
  const { t } = useT();
  const router = useRouter();
  const authed = useIsAuthed();
  const access = useAccess();
  const admin = ADMIN_SHORTCUTS.flatMap((k) => { const m = moduleByKey(k); return m && access.admin && m.visible(access) ? [adminAction(m, t(`admHub.mod.${k}.title`))] : []; });
  const list = [...admin, ...ACTIONS.filter((a) => authed || !a.auth)];
  return (
    <View style={s.wrap}>
      <View style={s.head}><SectionHeader title={t("cl6.actions.title")} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail} decelerationRate="fast" snapToInterval={92} snapToAlignment="start">
        {list.map((a, i) => <ActionTile key={a.key} action={a} index={i} onPress={() => router.navigate(a.href as never)} />)}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 22, gap: 12 },
  head: { paddingHorizontal: 16 },
  rail: { paddingHorizontal: 16, gap: 14 },
});
