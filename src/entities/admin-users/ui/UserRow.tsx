import { RowCard, StatusPill } from "@/shared/ui/admin";
import { Icon } from "@/shared/ui";
import { humanizeSlug } from "@/shared/lib/format";
import type { UserHit } from "../model/types";

// A person in a list or picker: avatar, name, phone and role; a check mark when selected.
export function UserRow({ user, selected, onPress }: { user: UserHit; selected?: boolean; onPress?: () => void }) {
  return (
    <RowCard
      avatar={user.name || user.phone}
      title={user.name || user.phone}
      subtitle={user.phone}
      meta={`${humanizeSlug(user.role)} · ${user.lexgoId}`}
      right={selected ? <Icon name="check-circle" size={22} tone="accent" /> : user.status !== "active" ? <StatusPill status={user.status} /> : undefined}
      onPress={onPress}
    />
  );
}
