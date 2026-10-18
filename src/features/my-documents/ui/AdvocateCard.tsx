import { View } from "react-native";
import { Button, Card, Icon, Skeleton, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { MyDoc } from "@/entities/my-document";
import { useAdvocateLink } from "../model/useAdvocateLink";

// Who is working on it, chat and a call (compact buttons) — only once an advocate has claimed the request.
export function AdvocateCard({ doc }: { doc: MyDoc }) {
  const { t } = useT();
  const c = useColors();
  const a = useAdvocateLink(doc, true);
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Icon name="user-check" size={18} color={c.accent} />
        <Text variant="h4" style={{ flex: 1 }}>{doc.lawyer ? t("dm6.advocateName", { name: doc.lawyer }) : t("dm6.advocate")}</Text>
      </View>
      {a.chat.isLoading ? <Skeleton height={44} round={22} /> : a.roomId ? (
        <>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button title={t("dm11.actChat")} icon="message-circle" size="sm" onPress={a.openChat} style={{ flex: 1 }} />
            <Button title={t("dm6.call")} icon="phone" size="sm" variant="soft" loading={a.call.isPending} onPress={() => a.call.mutate()} style={{ flex: 1 }} />
          </View>
          <Text variant="caption" tone="gray2">{a.left !== null ? t("dm6.callsLeft", { n: a.left }) : t("dm6.callHint")}</Text>
        </>
      ) : (
        <Text variant="small" tone="gray">{a.chat.data?.message || t("dm6.chatWait")}</Text>
      )}
    </Card>
  );
}
