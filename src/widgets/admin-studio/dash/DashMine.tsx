import { View } from "react-native";
import { useRouter } from "expo-router";
import { Skeleton, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { ObjectRow, useMyObjects } from "@/entities/admin-studio";
import { useT } from "@/shared/i18n";

// "My work": the last five objects assigned to the user.
export function DashMine() {
  const { t } = useT();
  const q = useMyObjects();
  const router = useRouter();
  return (
    <SectionCard title={t("admStudio.dash.mine")}>
      <Text variant="caption" tone="gray">{t("admStudio.dash.mineHint")}</Text>
      {q.isLoading ? <Skeleton height={70} round={16} /> : null}
      {q.isError ? <Text variant="small" tone="gray">{t("adm.actionFailed")}</Text> : null}
      {q.data && !q.data.length ? <Text variant="small" tone="gray">{t("admStudio.dash.mineEmpty")}</Text> : null}
      <View style={{ gap: 10 }}>
        {q.data?.map((o) => <ObjectRow key={o.id} item={o} onPress={() => router.push({ pathname: "/manage/studio/object", params: { id: o.id } } as never)} />)}
      </View>
    </SectionCard>
  );
}
