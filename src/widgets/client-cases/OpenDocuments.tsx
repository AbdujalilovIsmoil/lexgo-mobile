import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { groupOf, useDocFlow } from "@/entities/my-document";
import { OpenDocRow } from "./OpenDocRow";

// Document work started and not back yet; hidden when there is none (a failed fetch stays silent).
export function OpenDocuments() {
  const { t } = useT();
  const router = useRouter();
  const flow = useDocFlow({ mode: "", status: "" });
  const open = flow.items.filter((d) => !d.fileReady && groupOf(d.status) !== "ready" && groupOf(d.status) !== "closed");
  if (!open.length) return null;
  return (
    <SectionCard title={t("ccs.open.openTitle")} action={{ label: t("ccs.viewAll"), onPress: () => router.push("/documents" as never) }}>
      <Text variant="small" tone="gray">{t("ccs.open.openLead")}</Text>
      <View style={s.list}>{open.map((d) => <OpenDocRow key={d.id} doc={d} />)}</View>
    </SectionCard>
  );
}

const s = StyleSheet.create({ list: { gap: 10, paddingTop: 10 } });
