import { StyleSheet, View } from "react-native";
import { Button, Icon, Pill, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { Journey, JourneyStep } from "@/entities/admin-studio";

type Props = { journey: Journey; busy: boolean; canEdit: boolean; onToggle: (s: JourneyStep) => void; onOpen: (s: JourneyStep) => void };

// The steps in order: a check or the number, the name, the constructor it fills, and — for the current / open step — the two actions
// "open the form" and "mark as done" (or clear the mark).
export function JourneySteps({ journey, busy, canEdit, onToggle, onOpen }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.col}>
      {journey.steps.map((st) => {
        const done = journey.completed.includes(st.key);
        const current = !done && journey.currentStep === st.key;
        return (
          <View key={st.key} style={[s.row, { backgroundColor: c.surface, borderColor: current ? c.accent : c.line }]}>
            <View style={[s.dot, { backgroundColor: done ? c.ok : current ? c.accent : c.surface2 }]}>
              {done ? <Icon name="check" size={14} tone="white" /> : <Text variant="caption" weight="bold" style={{ color: current ? "#FFFFFF" : c.gray }}>{st.order}</Text>}
            </View>
            <View style={s.body}>
              <View style={s.head}>
                <Text variant="small" weight="bold" numberOfLines={2} style={s.fill}>{st.title}</Text>
                {current ? <Pill small tone="blue" label={t("admStudioD.journeys.current")} /> : null}
              </View>
              <Text variant="caption" tone="gray">{st.formCode}{st.required ? ` · ${t("admStudioD.journeys.required")}` : ""}</Text>
              {canEdit && journey.actions.update ? (
                <View style={s.actions}>
                  <Button title={t("admStudioD.journeys.openForm")} icon="edit-2" size="sm" variant="soft" onPress={() => onOpen(st)} />
                  <Button title={done ? t("admStudioD.journeys.markUndone") : t("admStudioD.journeys.markDone")} icon={done ? "rotate-ccw" : "check"} size="sm" variant="line" loading={busy} onPress={() => onToggle(st)} />
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { flexDirection: "row", gap: 12, padding: 12, borderRadius: 18, borderWidth: 1.5 },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 2 },
  body: { flex: 1, gap: 4 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  fill: { flex: 1 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
});
