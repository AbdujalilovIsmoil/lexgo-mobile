import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { cutText, type DocReq } from "@/entities/doc-queue";

const ROWS = 3;

// What the client asked for, set as a quote (cut when long, «Ko'proq» expands) and, under it, their answers.
export function SheetNeed({ doc }: { doc: DocReq }) {
  const { t } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  const need = cutText(doc.need);
  const extra = doc.answers.length > ROWS;
  const long = need.cut || extra;
  const answers = open ? doc.answers : doc.answers.slice(0, ROWS);
  return (
    <View style={s.col}>
      <View style={[s.quote, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        <Icon name="message-square" size={16} color={c.accent} />
        <Text variant="small" tone={doc.need ? "ink" : "gray"} selectable style={s.flex}>{doc.need ? (open ? doc.need : need.text) : t("proDocSheet.noNeed")}</Text>
      </View>
      {answers.map((a) => (
        <View key={a.label} style={s.ans}>
          <Text variant="caption" tone="gray" numberOfLines={1}>{a.label}</Text>
          <Text variant="small" numberOfLines={open ? undefined : 2}>{a.value}</Text>
        </View>
      ))}
      {long ? (
        <PressableScale onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: open }} hitSlop={8} style={s.more}>
          <Text variant="small" weight="bold" tone="accent">{open ? t("proDocSheet.collapse") : t("proDocSheet.expand")}</Text>
          <Icon name={open ? "chevron-up" : "chevron-down"} size={16} color={c.accent} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  quote: { flexDirection: "row", gap: 10, padding: 12, borderRadius: radius.r, borderWidth: 1 },
  ans: { gap: 2, paddingHorizontal: 2 },
  more: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 36, alignSelf: "flex-start" },
  flex: { flex: 1 },
});
