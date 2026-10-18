import { StyleSheet, View } from "react-native";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { Avatar, GradientBox, Pill, Text } from "@/shared/ui";
import { humanizeSlug } from "@/shared/lib/format";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Top of the Boshqaruv screen: who is signed in, their roles and how much is unlocked.
export function HubHeader({ sections }: { sections: number }) {
  const { t } = useT();
  const insets = useInsets();
  const a = useAccess();
  const user = useSession()?.user;
  return (
    <GradientBox variant="dark" round={0} style={[s.box, { paddingTop: insets.top + 14 }]}>
      <View style={s.row}>
        <Avatar name={user?.name ?? "?"} size={52} />
        <View style={s.fill}>
          <Text variant="caption" style={s.kicker}>{t("admHub.title")}</Text>
          <Text variant="h3" tone="white" numberOfLines={1}>{user?.name}</Text>
        </View>
      </View>
      <View style={s.pills}>
        {a.roles.filter((r) => r !== "client").slice(0, 3).map((r) => <Pill key={r} label={humanizeSlug(r)} tone="glass" small />)}
        <Pill label={t("admHub.perms", { n: a.perms.length })} tone="glass" small icon="shield" />
        <Pill label={t("admHub.modulesN", { n: sections })} tone="glass" small icon="grid" />
      </View>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  box: { paddingHorizontal: 16, paddingBottom: 18, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  fill: { flex: 1 },
  kicker: { color: "#93C6FF" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
