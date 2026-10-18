import { RateCard, RateResult } from "@/features/urgent-request";
import { hasMeeting, joinable, ratingOpen, type Scope, type UrgentRequest } from "@/entities/urgent";
import { ActionBar } from "./ActionBar";
import { ActionSheets } from "./ActionSheets";
import { DetailBody } from "./DetailBody";
import { DetailHead } from "./DetailHead";
import { DetailOutcome } from "./DetailOutcome";
import { DetailPeople } from "./DetailPeople";
import { useRequestActions } from "./useRequestActions";

// One record in full, for the client (/urgent/[id]), an advocate (/pro/urgent/[id]) or the call center (/cc/urgent/[id]).
export function RequestDetail({ req, scope, pool }: { req: UrgentRequest; scope: Scope; pool?: boolean }) {
  const a = useRequestActions(req, scope, pool);
  const staff = scope !== "client";
  return (
    <>
      <DetailHead req={req} waiting={hasMeeting(req) && !joinable(req) && !a.actions.some((x) => x.key === "meet")} />
      {scope === "client" ? ratingOpen(req) ? <RateCard req={req} /> : <RateResult req={req} /> : null}
      <ActionBar actions={a.actions} chatWith={req.assignedLawyer?.name || (staff ? req.client?.name : "") || req.operator?.name} />
      <DetailBody req={req} />
      <DetailPeople req={req} staff={staff} />
      <DetailOutcome req={req} staff={staff} />
      <ActionSheets req={req} panel={a.panel} meId={a.meId} onClose={() => a.setPanel("")} />
    </>
  );
}
