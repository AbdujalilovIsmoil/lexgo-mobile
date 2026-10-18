import { useEffect, useMemo } from "react";
import { useSession } from "@/entities/session";
import { useOrgSelection, useOrganizations } from "@/entities/organization";

// The owner's own organizations and the one the /org screens work on. Staff accounts get the whole
// list from the backend, so it is filtered to owner_user_id === me (data isolation, TZ 3.5).
export function useCurrentOrg() {
  const me = useSession()?.user.id ?? "";
  const query = useOrganizations();
  const { uid, orgId, bind, select } = useOrgSelection();
  useEffect(() => {
    if (me && uid !== me) void bind(me);
  }, [me, uid, bind]);
  const orgs = useMemo(() => (me ? (query.data ?? []).filter((o) => o.ownerUserId === me) : []), [query.data, me]);
  const current = orgs.find((o) => o.id === orgId) ?? orgs[0] ?? null;
  return { query, orgs, current, select };
}
