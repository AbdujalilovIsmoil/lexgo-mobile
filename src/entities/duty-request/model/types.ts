// Duty-advocate request (TZ 14): the client never picks an advocate, the request goes to the call-center pool.
export type DutyKind = "service" | "custom" | "review";
export type Attach = { uri: string; name: string; mime: string; size: number };

export type DutyInput = {
  kind: DutyKind;
  serviceId?: string;
  need: string;
  title?: string;
  language: string;
  requestedType?: string;
  pageCount?: number;
  answers?: Record<string, unknown>;
  mainFile?: Attach;
  files: Attach[];
  voices: Attach[];
};

export type DutyGate = { amount: number; currency: string; pageCount: number; includedPages: number; extraPages: number; telegramSent: boolean };

// `created` is false when the server answered "a request is already open for this document".
export type DutyResult = { docId: string; workId: string; status: string; created: boolean; paymentRequired: boolean; gate: DutyGate | null; message: string };
export type ExistingRef = { id: string; workId: string; status: string; message: string };
export type DocTypeOptions = { items: string[]; optional: boolean; customAllowed: boolean; appliesTo: string[]; notAppliesTo: string[] };
export type ServiceDoc = { serviceId: string; templateId: string; title: string; lawyerFlow: boolean };
export type DocTypeFlow = "custom_from_scratch" | "template_lawyer_assisted" | "constructor_review";
