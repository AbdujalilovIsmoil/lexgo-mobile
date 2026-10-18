import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { Icon } from "../Icon";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";

type Props = { summary?: string; active?: number; children: ReactNode };

// Many filters behind one summary row ("Filters · Advokat · 5★"): tap to open the chip rows, they stay collapsed otherwise.
export function CcFilterBox({ summary, active = 0, children }: Props) {
  const c = useColors();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <PressableScale onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={[s.row, { borderColor: active ? c.accent : c.line, backgroundColor: c.surface }]}>
        <Icon name="sliders" size={17} color={active ? c.accent : c.gray} />
        <Text variant="small" weight="semibold" style={s.fill} numberOfLines={1}>{summary || t("adm.filters")}</Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={16} tone="gray" />
      </PressableScale>
      {open ? <View style={s.body}>{children}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 46, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1.5 },
  fill: { flex: 1 },
  body: { gap: 8, marginHorizontal: -16 },
});
