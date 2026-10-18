import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { IconButton } from "../IconButton";
import { Text } from "../Text";

type Props = { title?: string; subtitle?: string; onClose: () => void };

// Grab handle + title. This whole strip is the drag target of the sheet.
export function SheetHeader({ title, subtitle, onClose }: Props) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={[s.wrap, !title && s.bare]}>
      <View style={[s.handle, { backgroundColor: c.line }]} />
      {title ? (
        <View style={s.row}>
          <View style={s.col}>
            <Text variant="h3" numberOfLines={1}>{title}</Text>
            {subtitle ? <Text variant="small" tone="gray" numberOfLines={1}>{subtitle}</Text> : null}
          </View>
          <IconButton icon="x" size={36} onPress={onClose} label={t("a11y.close")} />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: 10, paddingBottom: 8 },
  bare: { paddingBottom: 16 }, // no title: the content still starts a little below the handle
  handle: { alignSelf: "center", width: 42, height: 5, borderRadius: 3, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18 },
  col: { flex: 1, gap: 2 },
});
