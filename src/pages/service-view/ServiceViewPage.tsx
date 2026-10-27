import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { GateNotice } from "@/entities/plan";
import { Button, EmptyState, Skeleton } from "@/shared/ui";
import { PreviewBody } from "@/shared/ui/preview/PreviewBody";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useSampleFile } from "./useSampleFile";

// "View document" of the catalogue: the clean template, read-only. No share or save control is
// drawn here - looking at a blank sample is free, getting the file is the paid "Download".
export function ServiceViewPage({ id }: { id: string }) {
  const { t } = useT();
  const router = useRouter();
  const f = useSampleFile(id);
  return (
    <AdminPage title={f.title || t("csv.docViewTitle")}>
      {f.loading ? (
        <View style={s.pad}><Skeleton height={26} round={12} /><Skeleton height={300} round={18} /></View>
      ) : f.gate ? (
        <View style={s.pad}>
          <GateNotice gate={f.gate} titled />
          <Button title={t("plans.choose")} icon="award" variant="gradient" full onPress={() => router.push("/subscription")} />
        </View>
      ) : f.failed ? (
        <View style={s.pad}>
          <EmptyState icon="alert-circle" title={t("csv.docViewError")} compact />
          <Button title={t("common.retry")} variant="soft" full onPress={f.retry} />
        </View>
      ) : f.empty || !f.uri ? (
        <View style={s.pad}><EmptyState icon="file" title={t("csv.docViewNoFile")} compact /></View>
      ) : (
        <View style={s.fill}>
          <PreviewBody uri={f.uri} kind={f.kind} name={f.name} mime={f.mime} />
        </View>
      )}
    </AdminPage>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  pad: { padding: 16, gap: 14 },
});
