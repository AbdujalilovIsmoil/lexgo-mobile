import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { OnbStep } from "@/entities/pro-onboarding";
import { useColors } from "@/shared/theme";
import { Button, Icon, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

type Props = { steps: OnbStep[]; onDocs: () => void };

const GO: Record<string, string> = { profile: "/pro/profile", identity: "/security", services: "/pro/services", pricing: "/pro/services" };

// The server's checklist (profile · identity · documents · services · pricing) with the screen that completes each step.
export function OnboardingSteps({ steps, onDocs }: Props) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const label = (k: string, fallback: string) => (t(`sl2.steps.${k}`).startsWith("sl2.") ? fallback || k : t(`sl2.steps.${k}`));
  return (
    <SectionCard title={t("sl2.stepsTitle")}>
      {steps.map((st, i) => (
        <View key={st.key || i} style={s.row}>
          <View style={[s.dot, { backgroundColor: st.completed ? c.okBg : c.surface2 }]}>
            {st.completed ? <Icon name="check" size={16} color={c.ok} /> : <Text variant="small" weight="bold" tone="gray">{i + 1}</Text>}
          </View>
          <View style={s.col}>
            <Text variant="body" weight="semibold">{label(st.key, st.title)}</Text>
            <Text variant="caption" tone="gray">{t(st.completed ? "sl2.stepDone" : st.required ? "sl2.stepRequired" : "sl2.stepOptional")}</Text>
          </View>
          {!st.completed && (st.key === "documents" || GO[st.key]) ? (
            <Button title={t(st.key === "documents" ? "sl2.upload" : "sl2.fill")} variant="soft" size="sm" onPress={() => (st.key === "documents" ? onDocs() : router.push(GO[st.key] as never))} />
          ) : null}
        </View>
      ))}
    </SectionCard>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 1 },
});
