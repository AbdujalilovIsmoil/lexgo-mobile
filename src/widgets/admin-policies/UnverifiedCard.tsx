import { View } from "react-native";
import { useSetUnverified, useUnverified, type UnverifiedMode } from "@/entities/admin-policies";
import { SectionCard } from "@/shared/ui/admin";
import { Card, Icon, Skeleton, Text, confirmDialog } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// How providers without verified identity appear in the catalogue: listed with a badge, or hidden.
export function UnverifiedCard() {
  const { t } = useT();
  const q = useUnverified();
  const set = useSetUnverified();
  const pick = (m: UnverifiedMode) =>
    m !== q.data && !set.isPending && confirmDialog({
      title: t("admPol.saveConfirm"), message: t(`admPolB.unv.${m}Text`), confirmLabel: t("adm.confirm"), cancelLabel: t("adm.cancel"), icon: "shield",
      onConfirm: async () => { await set.mutateAsync(m); },
    });
  return (
    <SectionCard title={t("admPolB.unv.title")}>
      <Text variant="small" tone="gray">{t("admPolB.unv.lead")}</Text>
      {q.data === undefined ? <Skeleton height={100} round={16} /> : (["badge", "hidden"] as UnverifiedMode[]).map((m) => (
        <Card key={m} tinted={q.data === m} onPress={() => pick(m)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Icon name={q.data === m ? "check-circle" : "circle"} size={22} tone={q.data === m ? "accent" : "gray"} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="body" weight="bold">{t(`admPolB.unv.${m}`)}</Text>
              <Text variant="caption" tone="gray">{t(`admPolB.unv.${m}Text`)}</Text>
            </View>
          </View>
        </Card>
      ))}
    </SectionCard>
  );
}
