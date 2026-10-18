import { PressableScale } from "@/shared/ui";
import { RemoveX } from "../../ui/RemoveX";
import type { PayMethod } from "../types";
import { CardFace } from "./CardFace";

// A saved card as the backend keeps it, drawn as a real bank card. onRemove adds the web cross.
export function MethodRow({ item, onPress, onRemove }: { item: PayMethod; onPress?: () => void; onRemove?: () => void }) {
  const face = <CardFace brand={item.brand} last4={item.last4} expires={item.expires} isDefault={item.isDefault} corner={onRemove ? <RemoveX onPress={onRemove} color="#FFFFFF" /> : undefined} />;
  return onPress ? <PressableScale scale={0.985} onPress={onPress}>{face}</PressableScale> : face;
}
