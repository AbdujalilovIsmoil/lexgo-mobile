import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { Dict } from "@/shared/lib/json";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";

export type RenderNode = (name: string, value: unknown, onChange: (v: unknown) => void) => ReactNode;
const HIDDEN = ["work_id"];

// A nested object as a collapsible group of typed fields; a list row also gets a remove button.
export function ObjectGroup({ label, value, onChange, renderNode, defaultOpen, onRemove }: { label: string; value: Dict; onChange: (v: Dict) => void; renderNode: RenderNode; defaultOpen?: boolean; onRemove?: () => void }) {
  const c = useColors();
  const [open, setOpen] = useState(!!defaultOpen);
  const entries = Object.entries(value).filter(([k]) => !HIDDEN.includes(k));
  return (
    <View style={[s.box, { borderColor: c.line }]}>
      <View style={s.head}>
        <PressableScale onPress={() => setOpen(!open)} style={s.title}>
          <Icon name={open ? "chevron-down" : "chevron-right"} size={18} tone="gray" />
          <Text variant="body" weight="bold" numberOfLines={1} style={{ flex: 1 }}>{label}</Text>
          <Text variant="caption" tone="gray2">{entries.length}</Text>
        </PressableScale>
        {onRemove ? <PressableScale onPress={onRemove} hitSlop={8}><Icon name="trash-2" size={18} color={c.err} /></PressableScale> : null}
      </View>
      {open ? <View style={s.body}>{entries.map(([k, v]) => <View key={k}>{renderNode(k, v, (nv) => onChange({ ...value, [k]: nv }))}</View>)}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  head: { flexDirection: "row", alignItems: "center", gap: 10, paddingRight: 14 },
  title: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, padding: 14 },
  body: { padding: 12, paddingTop: 2, gap: 14 },
});
