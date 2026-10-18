import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SectionHeader } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { TopicCard } from "./TopicCard";
import { TopicSheet } from "./TopicSheet";
import { TOPICS, type Topic } from "./topicsData";

// Home: "What's the issue?" — six situation cards; each opens its own drawer.
export function TopicsSection() {
  const { t } = useT();
  const [topic, setTopic] = useState<Topic | null>(null);
  const rows = [TOPICS.slice(0, 2), TOPICS.slice(2, 4), TOPICS.slice(4, 6)];
  return (
    <View style={s.wrap}>
      <SectionHeader title={t("topics.title")} sub={t("topics.sub")} />
      {rows.map((row, r) => (
        <View key={r} style={s.row}>
          {row.map((tp, i) => <TopicCard key={tp.key} topic={tp} index={r * 2 + i} onPress={() => setTopic(tp)} />)}
        </View>
      ))}
      <TopicSheet topic={topic} onClose={() => setTopic(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 26, gap: 12 },
  row: { flexDirection: "row", gap: 12 },
});
