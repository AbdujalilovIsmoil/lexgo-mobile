import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import type { SourceOption } from "@/entities/doc-queue";

const ICON: Record<string, IconName> = { template: "file-text", blank: "edit-3", ai_draft: "zap", attachment: "paperclip" };

type Props = { opt: SourceOption; current: boolean; busy: boolean; onPress: () => void };

// One thing the editor can open on: clean template, blank page, AI draft, a client / own .docx.
export function SourceRow({ opt, current, busy, onPress }: Props) {
  const c = useColors();
  const { t } = useT();
  const key = `ad4.source.${opt.type}`;
  const title = opt.title || (t(key) === key ? opt.type : t(key));
  return (
    <PressableScale onPress={onPress} disabled={!opt.available || busy} style={[s.row, { borderColor: current ? c.accent : c.line, backgroundColor: current ? c.tint : c.surface, opacity: opt.available ? 1 : 0.55 }]}>
      <View style={[s.icon, { backgroundColor: c.tint2 }]}><Icon name={ICON[opt.type] ?? "file"} size={19} color={c.accent} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" weight="semibold" numberOfLines={2}>{title}</Text>
        <Text variant="caption" tone="gray">{opt.available ? opt.note : opt.note || t("ad4.unavailable")}</Text>
      </View>
      {busy ? <ActivityIndicator color={c.accent} /> : current ? <Icon name="check-circle" size={20} color={c.accent} /> : !opt.available ? <Icon name="lock" size={16} tone="gray" /> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderRadius: 16, borderWidth: 1.5 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
