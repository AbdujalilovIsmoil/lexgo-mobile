import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { OrgStatus, type Organization } from "@/entities/organization";

// Strip under the page title: the organization being worked on; tap to switch or register another.
export function OrgBar({ org, onPress }: { org: Organization; onPress: () => void }) {
  const c = useColors();
  return (
    <View style={s.wrap}>
      <PressableScale onPress={onPress} style={[s.bar, { backgroundColor: c.tint, borderColor: c.line }]}>
        <Icon name="briefcase" size={18} color={c.accent} />
        <Text variant="body" weight="bold" numberOfLines={1} style={s.name}>{org.name}</Text>
        <OrgStatus status={org.verification} />
        <Icon name="chevron-down" size={18} tone="gray" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingBottom: 10 },
  bar: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
  name: { flex: 1 },
});
