import { StyleSheet, View } from "react-native";
import { Avatar, PressableScale, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { WorkloadChips, type OrgMember } from "@/entities/organization";

const load = (m: OrgMember) => m.workload.orders + m.workload.cases + m.workload.urgent;

// Who carries how much: one bar per member (scaled to the busiest); tap for what they work on.
export function MemberBars({ members, onOpen }: { members: OrgMember[]; onOpen: (m: OrgMember) => void }) {
  const { t } = useT();
  const sorted = [...members].sort((a, b) => load(b) - load(a));
  const max = Math.max(...sorted.map(load), 1);
  return (
    <View style={{ gap: 14 }}>
      {sorted.map((m) => (
        <PressableScale key={m.userId} onPress={() => onOpen(m)} style={s.item}>
          <View style={s.head}>
            <Avatar name={m.name || "?"} size={30} />
            <Text variant="small" weight="bold" numberOfLines={1} style={s.name}>{m.name || "—"}</Text>
            <Text variant="small" weight="bold">{t("og2.activeN", { n: load(m) })}</Text>
          </View>
          <ProgressBar value={load(m) / max} />
          <WorkloadChips w={m.workload} />
        </PressableScale>
      ))}
    </View>
  );
}

const s = StyleSheet.create({ item: { gap: 7 }, head: { flexDirection: "row", alignItems: "center", gap: 10 }, name: { flex: 1 } });
