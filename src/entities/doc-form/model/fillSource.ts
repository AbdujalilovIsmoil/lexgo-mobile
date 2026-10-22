import { generateDoc, previewDoc } from "../api/docFormApi";
import type { DocPreview, GeneratedDoc } from "./types";

// Where a manual fill reads its preview from, writes its result to and keeps its draft: the wizard (useDocFill, FillFlow, ReviewStep,
// PreviewSheet) knows nothing of services or requests, only of this. A catalogue service answers through the service endpoints; a template
// with no linked service through the document request started for it (`save` is that flow's server autosave).
export type FillSource = {
  draftId: string; // the draft belongs to (user, draftMode, draftId)
  draftMode: "manual" | "tpl";
  previewKey: string; // react-query key part of the server preview
  preview: (wire: Record<string, string>) => Promise<DocPreview>;
  generate: (wire: Record<string, string>) => Promise<GeneratedDoc>;
  save?: (wire: Record<string, string>) => Promise<void>; // server autosave of the full answers (request flow only)
  requestId?: string; // kept in the draft so the same request is resumed
  serverWire?: Record<string, string>; // the answers the server already holds (the autosave baseline)
  meta?: { category?: string; language?: string }; // analytics kind-of-thing only; unset = no analytics from this source
};

export const serviceSource = (serviceId: string): FillSource => ({
  draftId: serviceId,
  draftMode: "manual",
  previewKey: serviceId,
  preview: (wire) => previewDoc(serviceId, wire),
  generate: (wire) => generateDoc(serviceId, wire),
});
