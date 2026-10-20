import { Modal, View } from "react-native";
import { accountGate, isSellerUser, useSession } from "@/entities/session";
import { useColors } from "@/shared/theme";
import { OverlayHost } from "@/shared/ui";
import { GateCard } from "./GateCard";
import { useGateStore } from "./gateStore";

// TZ 3.2: an account that is not `active` never reaches the role shell silently. Blocked / deleted /
// rejected / restricted accounts get a gate that cannot be closed; pending ones a soft gate.
export function AccountGate({ suppressed }: { suppressed?: boolean }) {
  const c = useColors();
  const user = useSession()?.user;
  const dismissed = useGateStore((s) => s.dismissed);
  const gate = user ? accountGate(user.accountStatus) : "ok";
  const key = user ? `${user.id}:${gate}` : "";
  if (!user || gate === "ok" || suppressed || (gate === "pending" && dismissed === key)) return null;
  return (
    <Modal visible animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={() => {}}>
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: c.canvas }}>
        <GateCard gate={gate} seller={isSellerUser(user)} name={user.name} skey={key} />
      </View>
      <OverlayHost />
    </Modal>
  );
}
