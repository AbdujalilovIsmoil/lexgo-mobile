// Backend field types seen live: text, textarea, number, date, phone, email.
// Anything else (select, multiselect, checkbox …) is handled; unknown ones act as text.
export type DocField = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  hint?: string;
  options: string[];
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  order: number;
  source?: string;
};

export type DocSection = { id: string; title: string; order: number; fields: DocField[] };

// GET /services/{id}/document-fields (also the template part of the AI questions).
export type DocSchema = {
  serviceId: string;
  templateId: string;
  title: string;
  sections: DocSection[];
  requiredCount: number;
  hasSourceFile: boolean;
  sourceFileName: string;
  aiFlow: boolean;
  lawyerFlow: boolean;
};

export type DocAnswers = Record<string, string>;

export type MissingField = { key: string; label: string };

// POST …/document-preview
export type DocPreview = { text: string; missing: MissingField[]; canGenerate: boolean; percent: number };

export type DocFile = { name: string; mime: string; path: string; format: string };

// POST …/document-generate and …/document-ai/generate: a finished request + its file.
export type GeneratedDoc = {
  requestId: string;
  workId: string;
  title: string;
  status: string;
  paid: boolean;
  price: number;
  mode: string;
  file: DocFile | null;
};

export type AiQuestions = { sections: DocSection[]; note: string };
