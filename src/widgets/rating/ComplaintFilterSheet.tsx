import { StyleSheet, View } from "react-native";
import { useComplaintLabels, type ComplaintStage } from "@/entities/rating";
import type { useComplaintFilters } from "@/features/rating";
import { BottomSheet, SheetOption, Button, IconButton, SheetScroll, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

type F = ReturnType<typeof useComplaintFilters>;

// Type (only when both kinds exist) and status (with live counts) in one sheet, a pinned "reset" + "show N" bar.
export function ComplaintFilterSheet({ f, visible, onClose }: { f: F; visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const L = useComplaintLabels();
  const dot: Record<string, string> = { new: c.warn, review: c.accent, rework: "#00CFE8", resolved: c.ok, rejected: c.err, closed: c.gray2 };
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dm11.filters")} snaps={[0.7, 0.92]}>
      <View style={s.flex}>
        <SheetScroll>
          {f.bothKinds ? (
            <View style={s.group}>
              <Text variant="small" tone="gray">{t("cpl.kind")}</Text>
              {(["all", "manual", "quality"] as const).map((k) => <SheetOption key={k} on={f.kind === k} label={t(`pwc.filter.${k}`)} count={k === "all" ? f.manual + f.quality : f[k]} onPress={() => f.setKind(k)} />)}
            </View>
          ) : null}
          {f.stages.length > 1 ? (
            <View style={s.group}>
              <Text variant="small" tone="gray">{t("cpl.status")}</Text>
              <SheetOption on={f.stage === ""} label={t("pwc.allStatuses")} onPress={() => f.setStage("")} />
              {f.stages.map((st: ComplaintStage) => <SheetOption key={st} on={f.stage === st} label={L.stage(st)} color={dot[st]} count={f.stageCount(st)} onPress={() => f.setStage(st)} />)}
            </View>
          ) : null}
        </SheetScroll>
        <View style={[s.bar, { borderTopColor: c.line, paddingBottom: insets.bottom + 14 }]}>
          <IconButton icon="rotate-ccw" size={48} label={t("pwc.filter.reset")} onPress={f.reset} />
          <Button title={`${t("dm11.fShow")} · ${f.shown.length}`} variant="gradient" full style={s.flex} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 2, marginBottom: 14 },
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingHorizontal: 20, borderTopWidth: 1 },
});
