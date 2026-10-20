import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, GradientBox, Text } from "@/shared/ui";
import { useStudioAccess } from "@/entities/admin-studio";
import { useT } from "@/shared/i18n";

// The studio home's lead, as on the web: one line on how to work (set the sections up in order, send for approval, publish), and the two
// actions — the Excel export (admins) and "New service or package" (editors).
export function StudioHero({ onExport, exporting }: { onExport: () => void; exporting: boolean }) {
  const { t } = useT();
  const a = useStudioAccess();
  const router = useRouter();
  if (!a.isAdmin && !a.canEdit) return null;
  return (
    <GradientBox variant="dark" round={24} style={s.box}>
      <Text variant="small" style={s.lead}>{t("admStudioD.home.lead")}</Text>
      <View style={s.row}>
        {a.canEdit ? <Button title={t("admStudioD.home.newBtn")} icon="plus" variant="gradient" onPress={() => router.push("/manage/studio/create" as never)} style={s.fill} /> : null}
        {a.isAdmin ? <Button title={t("admStudioD.home.excel")} icon="download" variant="soft" loading={exporting} onPress={onExport} /> : null}
      </View>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  box: { padding: 16, gap: 14 },
  lead: { color: "rgba(255,255,255,0.82)" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  fill: { flex: 1 },
});
