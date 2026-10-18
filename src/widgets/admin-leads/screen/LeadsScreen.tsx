import type { ReactElement, ReactNode } from "react";
import { LeadsList } from "./LeadsList";
import { LeadsSheets } from "./LeadsSheets";
import { PageActions } from "./PageActions";
import { useLeadsPage } from "./useLeadsPage";

export type LeadsFrame = (parts: { actions: ReactNode; children: ReactNode }) => ReactElement;

// The sales pipeline (list + every sheet) without a frame: the admin page and the call-center tab each supply theirs,
// receiving the header actions (filters / add / more) and the body.
export function LeadsScreen({ frame, bottomPad }: { frame: LeadsFrame; bottomPad?: number }) {
  const p = useLeadsPage();
  return frame({ actions: <PageActions p={p} />, children: <><LeadsList p={p} bottomPad={bottomPad} /><LeadsSheets p={p} /></> });
}
