import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, Icon, IconButton, PressableScale, Text, backIcon } from "@/shared/ui";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";

type Props = { title: string; subtitle: string; group: boolean; online: boolean; onInfo: () => void; right: ReactNode };

// Header of a chat room: back, avatar (people icon for a group), name + connection / member line, actions.
export function ChatHeader({ title, subtitle, group, online, onInfo, right }: Props) {
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  return (
    <View style={[s.bar, { paddingTop: insets.top + HEADER_GAP, borderBottomColor: c.line }]}>
      <IconButton icon={backIcon} onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
      <PressableScale onPress={onInfo} haptic={false} style={s.who}>
        {group ? <View style={[s.group, { backgroundColor: c.tint2 }]}><Icon name="users" size={18} tone="accent" /></View> : <Avatar name={title} size={38} />}
        <View style={s.titles}>
          <Text variant="body" weight="bold" numberOfLines={1}>{title}</Text>
          <View style={s.line}>
            <View style={[s.dot, { backgroundColor: online ? c.ok : c.warn }]} />
            <Text variant="caption" tone="gray" numberOfLines={1}>{subtitle}</Text>
          </View>
        </View>
      </PressableScale>
      <View style={s.right}>{right}</View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingBottom: 8, borderBottomWidth: 1 },
  who: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  group: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  titles: { flex: 1, gap: 1 },
  line: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
});
