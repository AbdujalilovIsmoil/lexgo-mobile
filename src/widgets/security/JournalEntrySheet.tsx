import { View } from "react-native";
import { kindIcon, type JournalEntry } from "@/entities/security";
import { fmtDateTime } from "@/shared/lib/format";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { BottomSheet, Button, Icon, Pill, SheetScroll, Text } from "@/shared/ui";
import { entryRoute, entryTitle } from "./journalText";
import { useToneColors } from "./kindStyle";

type Props = { entry: JournalEntry | null; visible: boolean; onClose: () => void };

// Details of one entry: full time, type, device, address, result and the note. Empty facts are left out.
export function JournalEntrySheet({ entry, visible, onClose }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const insets = useInsets();
  const tone = useToneColors();
  if (!entry) return null;
  const tc = tone(entry.kind, entry.failed);
  const result = entry.failed ? t(entry.source === "event" ? "secUx.resAlert" : "secUx.resFail") : t("secUx.resOk");
  const facts: [string, string][] = [
    [t("secUx.dTime"), fmtDateTime(entry.createdAt, locale)],
    [t("secUx.dKind"), t(`secUx.kind.${entry.kind}`)],
    [t("secUx.dDevice"), entry.agent],
    [t("secUx.dIp"), entry.fromIp ? "" : entry.ip],
    [t("secUx.dFrom"), entry.fromIp && entry.ip ? entryRoute(entry) : ""],
    [t("secUx.dResult"), result],
    [t("secUx.dReason"), entry.detail],
  ];
  return (
    <BottomSheet visible={visible} onClose={onClose} title={entryTitle(entry, t, locale)} snaps={[0.62]}>
      <SheetScroll contentContainerStyle={{ gap: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: tc.bg, alignItems: "center", justifyContent: "center" }}>
            <Icon name={kindIcon(entry.kind)} size={18} color={tc.fg} />
          </View>
          <Pill small tone={entry.failed ? "err" : "ok"} label={result} />
        </View>
        {facts.filter(([, v]) => v).map(([k, v]) => (
          <View key={k} accessible accessibilityLabel={`${k}: ${v}`} style={{ flexDirection: "row", gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.line }}>
            <Text variant="small" tone="gray" style={{ width: 96 }}>{k}</Text>
            <Text variant="small" weight="semibold" selectable style={{ flex: 1 }}>{v}</Text>
          </View>
        ))}
      </SheetScroll>
      <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: insets.bottom + 10, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.surface }}>
        <Button title={t("adm.close")} variant="soft" full onPress={onClose} />
      </View>
    </BottomSheet>
  );
}
