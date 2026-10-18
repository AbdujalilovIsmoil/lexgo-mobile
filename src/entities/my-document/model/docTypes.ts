import type { DocGate, DocRow } from "./types";

export type DocField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  options: string[];
  section: string;
  sectionOrder: number;
  order: number;
};

export type DocFileInfo = { name: string; mime: string; path: string };

// Full document request (GET /document-requests/{id}).
export type MyDoc = DocRow & {
  documentType: string;
  fields: DocField[];
  answers: Record<string, unknown>;
  paid: boolean;
  requiresPayment: boolean;
  paymentStatus: string;
  paymentId: string;
  gate: DocGate | null;
  pageCount: number;
  file: DocFileInfo | null;
  updatedAt: string;
};

export type DocVersion = { id: string; number: number; createdAt: string; contractId: string; answerCount: number };
export type MissingField = { name: string; label: string };
export type UnlockPolicy = { paid: boolean; requiresPayment: boolean; canGenerate: boolean; amount: number; currency: string; formats: string[]; missing: MissingField[] };
export type DocPreview = { text: string; canGenerate: boolean; percent: number; missing: MissingField[] };
export type DocChat = { available: boolean; roomId: string; message: string };
export type DocCall = { id: string; roomId: string; remaining: number | null };
