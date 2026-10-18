import { View } from "react-native";
import { Pill, type PillTone } from "@/shared/ui";
import { humanizeSlug } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import type { Delivery } from "../model/types";

const TONE: Record<string, PillTone> = { delivered: "ok", pending: "warn", failed: "err", unknown: "gray" };

// Per-channel delivery status of a sent notification: "Push · Delivered", "Telegram · Waiting" …
export function DeliveryChips({ items }: { items: Delivery[] }) {
  const { t } = useT();
  if (!items.length) return null;
  const name = (c: string) => (t(`admNtfC.channel.${c}`) !== `admNtfC.channel.${c}` ? t(`admNtfC.channel.${c}`) : humanizeSlug(c));
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {items.map((x) => <Pill key={x.channel} label={`${name(x.channel)} · ${x.tone === "unknown" ? humanizeSlug(x.status) : t(`admNtfC.delivery.${x.tone}`)}`} tone={TONE[x.tone]} small />)}
    </View>
  );
}
