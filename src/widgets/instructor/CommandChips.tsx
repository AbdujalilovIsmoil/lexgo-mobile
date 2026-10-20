import { StyleSheet, View } from "react-native";
import { useCmdStatus, type Command, type CmdStatus } from "@/entities/instructor";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const ICON: Record<CmdStatus, IconName> = { pending: "clock", running: "loader", done: "check-circle", missing: "alert-circle", failed: "x-circle", cancelled: "slash", skipped: "minus-circle" };

// What the assistant did with each command of an answer, live (opened / shown / not found / stopped …).
export function CommandChips({ commands }: { commands: Command[] }) {
  const c = useColors();
  const { t } = useT();
  const map = useCmdStatus((s) => s.map);
  const rows = commands.filter((x) => x.type !== "show_steps" && map[x.id]).slice(0, 6);
  if (!rows.length) return null;
  const tone: Record<CmdStatus, string> = { pending: c.gray, running: c.accent, done: c.ok, missing: c.warn, failed: c.err, cancelled: c.gray, skipped: c.gray };
  return (
    <View style={s.wrap}>
      {rows.map((x) => {
        const st = map[x.id].status;
        return (
          <View key={x.id} style={[s.chip, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
            <Icon name={ICON[st]} size={13} color={tone[st]} />
            <Text variant="caption" style={{ color: tone[st] }}>{t(`ax2.cmd.${x.type}`)} · {t(`ax2.st.${st}`)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, borderWidth: 1 },
});
