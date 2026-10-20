import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { ActionList } from "@/shared/ui/admin";
import { tOr } from "@/shared/lib/pro/tOr";
import { fmtDate } from "@/shared/lib/format";
import { useSession } from "@/entities/session";
import type { Journey } from "@/entities/admin-studio";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const RING = 54;
const STROKE = 6;
type Props = { item: Journey; onPress: () => void; onAct?: (a: "abandon" | "archive" | "restore") => void };

// One creation process as a compact row: a ring with the percent, the name, a single quiet line (type · author · date) and the step it
// is on; the stop / archive / restore actions sit behind "⋯". Only a state worth noticing (stopped, archived, done) shows a mark.
export function JourneyRow({ item, onPress, onAct }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const me = useSession()?.user.id ?? "";
  const [menu, setMenu] = useState(false);
  const type = tOr(t, `admStudioD.journeys.types.${item.type}`, item.type);
  const owner = item.ownerId && item.ownerId === me ? t("admStudioD.jlist.ownerYou") : item.ownerName || t("admStudioD.jlist.ownerOther");
  const step = item.steps.find((s) => s.key === item.currentStep);
  const stepName = step ? tOr(t, `admStudioD.create.step.${step.key}`, step.title) : "";
  const a = item.actions;
  const done = item.status === "completed";
  const tint = done ? c.ok : item.status === "abandoned" ? c.err : item.status === "archived" ? c.gray2 : c.accent;
  const rect = Skia.XYWHRect(STROKE / 2, STROKE / 2, RING - STROKE, RING - STROKE);
  const full = Skia.PathBuilder.Make().addArc(rect, 0, 359.9).build();
  const arc = Skia.PathBuilder.Make().addArc(rect, -90, Math.max((item.percent / 100) * 360, item.percent ? 5 : 0)).build();
  const actions = [
    ...(a.abandon ? [{ key: "abandon", label: t("admStudioD.jlist.abandon"), icon: "x-circle" as const, danger: true, onPress: () => onAct?.("abandon") }] : []),
    ...(a.archive ? [{ key: "archive", label: t("admStudioD.jlist.archive"), icon: "archive" as const, onPress: () => onAct?.("archive") }] : []),
    ...(a.restore ? [{ key: "restore", label: t("admStudioD.jlist.restore"), icon: "rotate-ccw" as const, onPress: () => onAct?.("restore") }] : []),
  ];
  const mark = item.status === "draft" || item.status === "in_progress" ? "" : tOr(t, `admStudioD.journeys.status.${item.status}`, item.status);
  return (
    <PressableScale onPress={onPress} accessibilityLabel={`${item.title || type}, ${item.percent}%`} style={[s.row, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
      <View style={s.ring}>
        <Canvas style={{ width: RING, height: RING }}>
          <Path path={full} style="stroke" strokeWidth={STROKE} color={c.surface2} />
          {item.percent ? <Path path={arc} style="stroke" strokeWidth={STROKE} color={tint} strokeCap="round" /> : null}
        </Canvas>
        <View style={s.mid} pointerEvents="none">{done ? <Icon name="check" size={20} color={c.ok} /> : <Text variant="caption" weight="bold">{item.percent}%</Text>}</View>
      </View>
      <View style={s.body}>
        <Text variant="body" weight="bold" numberOfLines={1}>{item.title || type}</Text>
        <Text variant="caption" tone="gray" numberOfLines={1}>{[type, owner, item.createdAt ? fmtDate(item.createdAt, locale) : ""].filter(Boolean).join(" · ")}</Text>
        <Text variant="caption" weight="semibold" numberOfLines={1} style={{ color: mark ? tint : c.gray2 }}>
          {mark || (stepName ? `${t("admStudioD.jlist.stepNow")}: ${stepName}` : t("admStudioD.journeys.progress", { done: item.done, total: item.total }))}
        </Text>
      </View>
      {onAct && actions.length ? (
        <PressableScale onPress={() => setMenu(true)} hitSlop={10} accessibilityLabel={t("admLeads.more")} style={s.more}><Icon name="more-horizontal" size={20} tone="gray" /></PressableScale>
      ) : <Icon name="chevron-right" size={18} color={c.gray2} />}
      <ActionList visible={menu} onClose={() => setMenu(false)} title={item.title || type} actions={actions} />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 20, borderWidth: 1 },
  ring: { width: RING, height: RING },
  mid: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0, gap: 2 },
  more: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
