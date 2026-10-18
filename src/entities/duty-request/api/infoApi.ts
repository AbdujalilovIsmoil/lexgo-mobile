import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { DocTypeFlow, DocTypeOptions, ServiceDoc } from "../model/types";

const strs = (v: unknown): string[] => asArr(v).map((x) => asStr(x)).filter(Boolean);

// The kinds of document an advocate can be asked for (optional field, set by the backend).
export async function getDocTypes(): Promise<DocTypeOptions> {
  const d = asDict(await http("/document-services/request-document-types"));
  return { items: strs(d.items), optional: d.optional !== false, customAllowed: d.custom_allowed !== false, appliesTo: strs(d.applies_to), notAppliesTo: strs(d.not_applies_to) };
}

// Whether the backend wants this field on that flow (analysis / existing-review explicitly do not).
export const docTypeApplies = (o: DocTypeOptions | undefined, flow: DocTypeFlow): boolean =>
  !!o && o.items.length > 0 && !o.notAppliesTo.includes(flow) && (!o.appliesTo.length || o.appliesTo.includes(flow));

// Service header for the form: its title, its template (duplicate detection) and whether an advocate flow exists.
export async function getServiceDoc(serviceId: string): Promise<ServiceDoc> {
  const d = asDict(await http(`/services/${encodeURIComponent(serviceId)}/document-fields`));
  return { serviceId: asStr(d.service_id, serviceId), templateId: asStr(d.template_id), title: asStr(d.title), lawyerFlow: !!(d.lawyer_flow && Object.keys(asDict(d.lawyer_flow)).length) };
}
