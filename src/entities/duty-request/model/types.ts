// Duty-advocate request (TZ 14): the client never picks an advocate, the request goes to the call-center pool.
// "template": a ready template with NO linked service — the document request is started from the template and sent to the pool (README §11.4).
export type DutyKind = "service" | "custom" | "review" | "template";
export type Attach = { uri: string; name: string; mime: string; size: number };

export type DutyInput = {
  kind: DutyKind;
  serviceId?: string;
  templateId?: string; // kind "template"
  resumeDocId?: string; // kind "template": the document request the constructor already started
  category?: string; // analytics only
  need: string;
  title?: string;
  language: string;
  requestedType?: string;
  pageCount?: number;
  urgency?: string;
  answers?: Record<string, unknown>;
  mainFile?: Attach;
  files: Attach[];
  voices: Attach[];
};

export type DutyGate = { amount: number; currency: string; pageCount: number; includedPages: number; extraPages: number; telegramSent: boolean };

// The backend's "will you also fill it in yourself?" question that can ride along with a lawyer request (README §12).
export type DutyCtor = { available: boolean; promptRequired: boolean; title: string; message: string };
// `created` is false when the server answered "a request is already open for this document".
export type DutyResult = { docId: string; workId: string; status: string; created: boolean; paymentRequired: boolean; gate: DutyGate | null; message: string; ctor: DutyCtor | null };
export type ExistingRef = { id: string; workId: string; status: string; message: string };
export type DocTypeOptions = { items: string[]; optional: boolean; customAllowed: boolean; appliesTo: string[]; notAppliesTo: string[] };
export type ServiceDoc = { serviceId: string; templateId: string; title: string; lawyerFlow: boolean };
export type DocTypeFlow = "custom_from_scratch" | "template_lawyer_assisted" | "constructor_review";
