import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useServiceSearch } from "@/entities/service";
import { useLawyerFilterStore } from "@/features/lawyer-filter";
import { ServicesSheet } from "@/widgets/service-sheets";
import { Button, Text } from "@/shared/ui";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { TopicLawyers } from "./TopicLawyers";
import type { Topic } from "./topicsData";

type Props = { topic: Topic | null; onClose: () => void };

// Everything about one situation: matching services (tap for details), matching
// lawyers, and shortcuts to ask the AI or open the lawyer list pre-filtered.
export function TopicSheet({ topic: current, onClose }: Props) {
  const topic = useKept(current);
  const { t } = useT();
  const router = useRouter();
  const setFilter = useLawyerFilterStore((s) => s.set);
  const navigate = useSheetNavigate(onClose);
  const { data, isFetching } = useServiceSearch(topic?.query ?? "");
  const title = topic ? t(`topics.items.${topic.key}.title`) : "";
  const ask = () => navigate(() => router.navigate({ pathname: "/(tabs)/ai", params: { q: t("topics.aiPrompt", { topic: title }) } }));
  const lawyers = () => {
    setFilter({ area: topic?.area ?? "" });
    navigate(() => router.navigate("/(tabs)/lawyers"));
  };
  return (
    <ServicesSheet
      visible={!!current}
      onClose={onClose}
      title={title}
      subtitle={topic ? t(`topics.items.${topic.key}.desc`) : undefined}
      services={data}
      loading={isFetching && !data}
      before={<Text variant="h4">{t("topics.services")}</Text>}
      after={
        <View style={s.col}>
          {topic ? <TopicLawyers area={topic.area} onOpen={(l) => navigate(() => router.push({ pathname: "/specialist/[id]", params: { id: l.userId || l.id } }))} /> : null}
          <View style={s.actions}>
            <Button title={t("topics.askAi")} onPress={ask} variant="gradient" icon="zap" full />
            <Button title={t("topics.findLawyer")} onPress={lawyers} variant="soft" icon="users" full />
          </View>
        </View>
      }
    />
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  actions: { gap: 10, marginTop: 8 },
});
