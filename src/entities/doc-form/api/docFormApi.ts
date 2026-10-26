import { http } from "@/shared/api";
import { asDict, asStr } from "@/shared/lib/json";
import { buildSections, normSchema } from "./normSchema";
import { normGenerated, normPreview } from "./normResult";
import type { AiQuestions, DocPreview, DocSchema, GeneratedDoc } from "../model/types";

const base = (serviceId: string) => `/services/${encodeURIComponent(serviceId)}`;
const post = (path: string, body: unknown) => http(path, { method: "POST", body });

// GET /services/{id}/document-fields — the section-based schema (404 = no template).
export async function getDocSchema(serviceId: string, extraTitle: string): Promise<DocSchema> {
  return normSchema(await http(`${base(serviceId)}/document-fields`), serviceId, extraTitle);
}

// The clean (marker-free) template: the only copy of the blank a client may open.
export const cleanSourcePath = (serviceId: string): string => `${base(serviceId)}/document-template/clean-source-file`;

export async function previewDoc(serviceId: string, answers: Record<string, string>): Promise<DocPreview> {
  return normPreview(await post(`${base(serviceId)}/document-preview`, { answers }));
}

export async function generateDoc(serviceId: string, answers: Record<string, string>): Promise<GeneratedDoc> {
  return normGenerated(await post(`${base(serviceId)}/document-generate`, { answers }));
}

// POST …/document-ai/questions — dynamic questions (template fields + AI questions).
export async function getAiQuestions(serviceId: string, need: string, language: string, extraTitle: string): Promise<AiQuestions> {
  const d = asDict(await post(`${base(serviceId)}/document-ai/questions`, { need, language }));
  return { sections: buildSections(d.sections, d.questions, extraTitle), note: asStr(d.note) };
}

export type AiInput = { need: string; answers: Record<string, string>; language: string; extra?: string };

export async function generateAiDoc(serviceId: string, i: AiInput): Promise<GeneratedDoc> {
  const body = { need: i.need, answers: i.answers, language: i.language, ...(i.extra ? { extra_instructions: i.extra } : {}) };
  return normGenerated(await post(`${base(serviceId)}/document-ai/generate`, body));
}
