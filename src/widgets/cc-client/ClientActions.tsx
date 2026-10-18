import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { useOpenClientChat } from "@/entities/admin-callcenter";
import { StartMeetingButton } from "@/features/admin-callcenter";
import { Button } from "@/shared/ui";
import { openTel } from "@/shared/lib/links";
import { useT } from "@/shared/i18n";

type Props = { id: string; name: string; phone: string };

// Reach the client: call, message (secure room), video meeting, send a notification.
export function ClientActions({ id, name, phone }: Props) {
  const { t } = useT();
  const router = useRouter();
  const { can } = useAccess();
  const chat = useOpenClientChat(useSession()?.user.id ?? "");
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {phone ? <Button title={t("adm.call")} icon="phone" size="sm" onPress={() => openTel(phone)} /> : null}
      <Button title={t("cc2.message")} icon="message-circle" size="sm" variant="soft" loading={chat.isPending} onPress={() => chat.mutate(id)} />
      <StartMeetingButton clientUserId={id} phone={phone} name={name} />
      {can("notifications.manage") ? <Button title={t("cc2.notify")} icon="send" size="sm" variant="line" onPress={() => router.push({ pathname: "/cc/notify", params: { to: id, name } } as never)} /> : null}
    </View>
  );
}
