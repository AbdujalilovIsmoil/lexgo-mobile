import type { DocTypes } from "../model/lookupTypes";

export type DocFlow = "custom_from_scratch" | "template_lawyer_assisted";

// Whether the optional "document type" line is offered for this flow (the backend decides).
export function docTypeApplies(o: DocTypes | undefined, flow: DocFlow): boolean {
  if (!o || !o.items.length || o.notAppliesTo.includes(flow)) return false;
  return o.appliesTo.length ? o.appliesTo.includes(flow) : true;
}
