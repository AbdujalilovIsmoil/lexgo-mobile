import { Icon } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { humanizeSlug } from "@/shared/lib/format";
import type { Person } from "../model/usePeople";

// A person in a picker: avatar, name, phone (when the account may see it), role + public id; a check when selected.
export function PersonRow({ person, selected, onPress }: { person: Person; selected?: boolean; onPress?: () => void }) {
  return (
    <RowCard
      avatar={person.name || "?"}
      title={person.name || person.phone}
      subtitle={person.phone || undefined}
      meta={[humanizeSlug(person.role), person.lexgoId].filter(Boolean).join(" · ")}
      right={selected ? <Icon name="check-circle" size={22} tone="accent" /> : undefined}
      onPress={onPress}
    />
  );
}
