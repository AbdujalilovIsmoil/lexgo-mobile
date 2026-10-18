import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { GateCard } from "@/widgets/auth-gate/GateCard";
import { LockScreen } from "@/widgets/auth-lock/LockScreen";
import { useColors } from "@/shared/theme";

// TEMPORARY visual preview of the gate / lock screens (deleted after the device check).
export default function Preview() {
  const c = useColors();
  const { v, seller } = useLocalSearchParams<{ v?: string; seller?: string }>();
  if (v === "lock") return <LockScreen unlock={{ status: "failed", busy: false, run: async () => {} }} />;
  const gate = (["pending", "blocked", "deleted", "rejected", "restricted"].includes(v ?? "") ? v : "blocked") as "pending";
  return (
    <View style={{ flex: 1, justifyContent: "center", backgroundColor: c.bg }}>
      <GateCard gate={gate} seller={seller === "1"} name="LexGo Client ONE" skey="x" />
    </View>
  );
}
