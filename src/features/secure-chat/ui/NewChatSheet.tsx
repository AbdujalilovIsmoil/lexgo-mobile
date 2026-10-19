import { View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { PeopleSheet } from "@/entities/person-search";
import { useSession } from "@/entities/session";
import { useAccess } from "@/entities/access";
import { canChatWith, useMarketOrders } from "@/entities/order";
import { chatKeys, type Room } from "@/entities/secure-chat";
import { ApiError } from "@/shared/api";
import { Button, Text, toast } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useOpenChat } from "../model/useOpenChat";

// "New chat": find a person (staff search everybody, others the lawyers directory) and open the secure chat with them.
// A client who has not paid the private-chat fee gets the server's 402 sentence and a way to the plans.
export function NewChatSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const open = useOpenChat(onClose);
  const qc = useQueryClient();
  const a = useAccess();
  const orders = useMarketOrders(visible && !(a.seller || a.canCalls || a.staff)).data;
  // A client may start a chat only with a specialist they have a running paid order with; chats they already have stay open.
  const allowed = (id: string) => a.seller || a.canCalls || a.staff || canChatWith(id, orders) || (qc.getQueryData<Room[]>(chatKeys.rooms) ?? []).some((r) => r.sellerId === id || r.members.some((m) => m.userId === id));
  const pay = open.error instanceof ApiError && open.error.status === 402;
  const note = pay ? (
    <View style={{ marginHorizontal: 18, marginBottom: 8, gap: 8 }}>
      <Text variant="small" tone="warn">{(open.error as ApiError).detail}</Text>
      <Button title={t("ms1.openPlans")} size="sm" onPress={() => { onClose(); router.push("/subscription" as never); }} />
    </View>
  ) : null;
  return <PeopleSheet visible={visible} onClose={onClose} title={t("ms1.newChat")} subtitle={t("ms1.newChatHint")} me={useSession()?.user.id ?? ""} note={note} onPick={(p) => (!allowed(p.id) ? toast(t("spf.chatLocked"), "info") : open.mutate(p.id))} busyId={open.isPending ? open.variables : undefined} />;
}
