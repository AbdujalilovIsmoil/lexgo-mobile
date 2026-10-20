import type { ReactElement, ReactNode } from "react";
import { LeadsList } from "./LeadsList";
import { LeadsSheets } from "./LeadsSheets";
import { PageActions } from "./PageActions";
import { useLeadsPage } from "./useLeadsPage";

export type LeadsFrame = (parts: { actions: ReactNode; children: ReactNode }) => ReactElement;

// The sales pipeline (list + every sheet) without a frame: the admin page and the call-center tab each supply theirs,
// receiving the header actions (filters / add / more) and the body.
// `scrollHeader`: the tab page's header and the action buttons live inside the list and scroll with it (the frame then gets no actions).
export function LeadsScreen({ frame, bottomPad, scrollHeader }: { frame: LeadsFrame; bottomPad?: number; scrollHeader?: boolean }) {
  const p = useLeadsPage();
  const actions = <PageActions p={p} />;
  return frame({ actions: scrollHeader ? null : actions, children: <><LeadsList p={p} bottomPad={bottomPad} scrollActions={scrollHeader ? actions : undefined} /><LeadsSheets p={p} /></> });
}
