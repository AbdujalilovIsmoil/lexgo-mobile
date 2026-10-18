import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Icon, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const ROWS: { icon: IconName; k: "sec" | "can" | "sup" }[] = [{ icon: "shield", k: "sec" }, { icon: "refresh-cw", k: "can" }, { icon: "headphones", k: "sup" }];

// Three reassurance rows and the "ask a question" button that opens the AI assistant.
export function Benefits() {
  const { t } = useT();
  const router = useRouter();
  return (
    <View style={{ gap: 10 }}>
      {ROWS.map((r) => (
        <Card key={r.k} tinted style={{ flexDirection: "row", gap: 12 }}>
          <Icon name={r.icon} size={22} tone="accent" />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="h4">{t(`cs.${r.k}T`)}</Text>
            <Text variant="small" tone="gray">{t(`cs.${r.k}X`)}</Text>
          </View>
        </Card>
      ))}
      <Button title={t("cs.ask")} icon="message-circle" variant="line" full onPress={() => router.push("/assistant")} />
    </View>
  );
}
