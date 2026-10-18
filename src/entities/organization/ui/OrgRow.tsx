import { RowCard } from "@/shared/ui/admin";
import { Icon } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useOrgText } from "../lib/useOrgText";
import type { Organization } from "../model/types";
import { OrgStatus } from "./OrgStatus";

// One of the owner's organizations (switch list); the current one is ticked.
export function OrgRow({ org, current, onPress }: { org: Organization; current: boolean; onPress: () => void }) {
  const c = useColors();
  const text = useOrgText();
  return (
    <RowCard icon="briefcase" title={org.name} subtitle={[text.region(org.region), org.inn].filter(Boolean).join(" · ")} right={current ? <Icon name="check-circle" size={22} color={c.ok} /> : <OrgStatus status={org.verification} />} onPress={onPress} />
  );
}
