import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { isPlain, isStrList, labelOf, SECTIONS, usePolicies, type Section } from "@/entities/admin-policies";
import { PolicyEditSheet } from "@/features/admin-policies";
import { FactRows, QueryBoundary, SectionCard } from "@/shared/ui/admin";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The six platform policy sections (order, payment, document analysis, workspace, security,
// notifications) as cards of their current values; each can be edited or its history opened.
export function PolicySections({ onHistory }: { onHistory: (s: Section) => void }) {
  const { t } = useT();
  const q = usePolicies();
  const [edit, setEdit] = useState<Section | null>(null);
  const show = (v: unknown): string => (isPlain(v) ? t("admPol.objectValue", { n: Object.keys(v).length }) : isStrList(v) ? (v.length > 6 ? `${v.slice(0, 6).join(", ")} … +${v.length - 6}` : v.join(", ") || "—") : Array.isArray(v) ? t("admPol.listValue", { n: v.length }) : typeof v === "boolean" ? t(v ? "adm.yes" : "adm.no") : String(v ?? "—"));
  const label = (k: string) => (t(`admPolB.keys.${k}`) !== `admPolB.keys.${k}` ? t(`admPolB.keys.${k}`) : labelOf(k));
  return (
    <QueryBoundary query={q}>
      <View style={{ gap: 12 }}>
        {SECTIONS.map((s, i) => {
          const rows = Object.entries(q.data?.[s] ?? {}).filter(([k]) => k !== "work_id");
          return (
            <Animated.View key={s} entering={FadeInUp.delay(i * 40).duration(220)}><SectionCard title={t(`admPol.sections.${s}`)} action={{ label: t("adm.edit"), onPress: () => setEdit(s) }}>
              {rows.length ? <FactRows rows={rows.map(([k, v]) => ({ label: label(k), value: show(v) }))} /> : <Text variant="small" tone="gray">{t("admPol.emptySection")}</Text>}
              <Button title={t("admPol.history")} icon="clock" variant="ghost" size="sm" onPress={() => onHistory(s)} />
            </SectionCard></Animated.View>
          );
        })}
        <PolicyEditSheet section={edit} data={edit ? q.data?.[edit] ?? {} : {}} onClose={() => setEdit(null)} />
      </View>
    </QueryBoundary>
  );
}
