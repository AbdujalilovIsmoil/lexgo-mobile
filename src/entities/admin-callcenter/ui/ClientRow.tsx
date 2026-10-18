import { RowCard, StatusPill } from "@/shared/ui/admin";
import { useCcLabel } from "../model/labels";
import type { CcClient } from "../model/types";

// A client found by name or phone.
export function ClientRow({ client, onPress }: { client: CcClient; onPress: () => void }) {
  const label = useCcLabel();
  return (
    <RowCard
      avatar={client.name || client.phone}
      title={client.name || client.phone}
      subtitle={[client.lexgoId, client.phone].filter(Boolean).join(" · ")}
      right={<StatusPill status={client.status} label={label("admCcC.clStatus", client.status)} />}
      onPress={onPress}
    />
  );
}
