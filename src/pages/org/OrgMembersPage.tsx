import { useState } from "react";
import { IconButton } from "@/shared/ui";
import { OrgScope } from "@/widgets/org-scope";
import { useT } from "@/shared/i18n";
import { MembersBody } from "./MembersBody";

// /org/members — roster with search / filters, add a member.
export default function OrgMembersPage() {
  const { t } = useT();
  const [adding, setAdding] = useState(false);
  return (
    <OrgScope title={t("og3.title")} right={() => <IconButton icon="user-plus" label={t("og3.add")} onPress={() => setAdding(true)} />}>
      {(org) => <MembersBody orgId={org.id} adding={adding} onClose={() => setAdding(false)} />}
    </OrgScope>
  );
}
