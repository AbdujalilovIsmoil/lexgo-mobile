import { Pill } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { useCcLabel, type CcClient } from "@/entities/admin-callcenter";

// A client found by name / phone / LexGo ID.
export function ClientTicket({ client, onPress }: { client: CcClient; onPress: () => void }) {
  const label = useCcLabel();
  return (
    <CcTicket
      tint="#00A870" avatar={client.name || client.phone} title={client.name || client.phone} subtitle={[client.lexgoId, client.name ? client.phone : ""].filter(Boolean).join(" · ")}
      badge={<Pill small tone="gray" label={label("admCcC.clStatus", client.status)} />} onPress={onPress}
    />
  );
}
