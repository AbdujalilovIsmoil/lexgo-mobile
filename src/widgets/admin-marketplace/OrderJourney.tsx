import { View } from "react-native";
import { Icon, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { journeyOf, type MktConfirm, type MktOrder, type StepState } from "@/entities/admin-marketplace";
import { fmtDateTime } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const ICON = { done: "check", now: "clock", fail: "x", todo: "circle" } as const;

// Four-step vertical stepper: where the order is right now.
export function OrderJourney({ order, confirm }: { order: MktOrder; confirm?: MktConfirm }) {
  const { t, locale } = useT();
  const c = useColors();
  const tone: Record<StepState, string> = { done: c.ok, now: c.accent, fail: c.err, todo: c.gray2 };
  const steps = journeyOf(order, confirm);
  return (
    <SectionCard title={t("admMktC.journey.title")}>
      {steps.map((s, i) => (
        <View key={s.key} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: `${tone[s.state]}22`, borderWidth: s.state === "now" ? 2 : 0, borderColor: tone[s.state] }}>
            <Icon name={ICON[s.state]} size={14} color={tone[s.state]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="small" weight="bold" tone={s.state === "todo" ? "gray" : "ink"}>{i + 1}. {t(`admMktC.journey.${s.label}`)}</Text>
            <Text variant="caption" tone="gray2">{s.at ? fmtDateTime(s.at, locale) : s.state === "now" ? t("admMktC.journey.waiting") : t(`admMktC.journey.state.${s.state}`)}</Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );
}
