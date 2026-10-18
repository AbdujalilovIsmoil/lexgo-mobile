export type Template = {
  id: string;
  name: string;
  slug: string;
  category: string;
  language: string;
  description: string;
  price: number;
  visibility: string;
  isActive: boolean;
  templateText: string; // only on the single-template GET
  fieldsCount: number;
};

export type TemplateField = { key: string; label: string; type: string; required: boolean };
export type Preview = { fields: TemplateField[]; previewText: string };

// Body of POST / PATCH /admin/document-templates (whole so'm).
export type TemplateInput = { slug: string; title: string; category: string; language: string; description: string; template_text: string; price: number; is_active: boolean };

export type PickedFile = { uri: string; name: string };
export type ImportMeta = { category: string; language: string; visibility: string; slug?: string; title?: string; price?: number };
export type ImportResult = { count: number; template?: Template; preview?: Preview };
