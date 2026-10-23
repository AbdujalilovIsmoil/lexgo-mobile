import { type ReactNode } from "react";
import { View } from "react-native";
import { useTablet } from "@/shared/lib/useTablet";

// The sections under a full-bleed hero: on a tablet they read as one centred column; on a phone this renders its children as they were.
export function TabletColumn({ children, max = 860 }: { children: ReactNode; max?: number }) {
  const { tablet } = useTablet();
  return tablet ? <View style={{ width: "100%", maxWidth: max, alignSelf: "center" }}>{children}</View> : <>{children}</>;
}
