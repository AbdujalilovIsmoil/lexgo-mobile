import { View } from "react-native";
import { useRouter } from "expo-router";
import { PeopleSheet } from "@/entities/person-search";
import { useSession } from "@/entities/session";
import { ApiError } from "@/shared/api";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useOpenChat } from "../model/useOpenChat";

// "New chat": find a person (staff search everybody, others the lawyers directory) and open the secure chat with them.
// A client who has not paid the private-chat fee gets the server's 402 sentence and a way to the plans.
export function NewChatSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const open = useOpenChat(onClose);
  const pay = open.error instanceof ApiError && open.error.status === 402;
  const note = pay ? (
    <View style={{ marginHorizontal: 18, marginBottom: 8, gap: 8 }}>
      <Text variant="small" tone="warn">{(open.error as ApiError).detail}</Text>
      <Button title={t("ms1.openPlans")} size="sm" onPress={() => { onClose(); router.push("/subscription" as never); }} />
    </View>
  ) : null;
  return <PeopleSheet visible={visible} onClose={onClose} title={t("ms1.newChat")} subtitle={t("ms1.newChatHint")} me={useSession()?.user.id ?? ""} note={note} onPick={(p) => open.mutate(p.id)} busyId={open.isPending ? open.variables : undefined} />;
}
