import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheet, Button, IconButton, SheetOption, SheetScroll, Text } from "@/shared/ui";
import { PeriodPicker, useDateRange, type DateRange } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

export const MEETING_STATUSES = ["", "active", "ended", "expired", "cancelled"];
type Props = { visible: boolean; onClose: () => void; status: string; onStatus: (v: string) => void; bar: DateRange };

// Status and period of the platform's meetings in one sheet; the period's "custom" opens a calendar to pick the first and last
// day. Nothing changes until the pinned button; "reset" empties both.
export function MeetingsFilterSheet({ visible, onClose, status, onStatus, bar }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const [st, setSt] = useState(status);
  const draft = useDateRange("all");
  const [seen, setSeen] = useState(visible);
  if (visible !== seen) {
    setSeen(visible);
    if (visible) {
      setSt(status);
      draft.setPreset(bar.preset);
      draft.setFrom(bar.from);
      draft.setTo(bar.to);
    }
  }
  const apply = () => {
    onStatus(st);
    bar.setPreset(draft.preset);
    bar.setFrom(draft.from);
    bar.setTo(draft.to);
    onClose();
  };
  const reset = () => { setSt(""); draft.setPreset("all"); draft.setFrom(""); draft.setTo(""); };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm11.filters")} snaps={[0.8, 0.94]}>
      <View style={s.flex}>
        <SheetScroll>
          <View style={s.group}>
            <Text variant="small" tone="gray">{t("adm.status")}</Text>
            {MEETING_STATUSES.map((v) => <SheetOption key={v} on={st === v} label={v ? t(`admMeet.cs.${v}`) : t("adm.all")} onPress={() => setSt(v)} />)}
          </View>
          <PeriodPicker bar={draft} label={t("pyx.period")} />
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("adm.reset")} onPress={reset} />
          <Button title={t("adm.apply")} variant="gradient" full style={s.flex} onPress={apply} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 8, marginBottom: 20 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
});
