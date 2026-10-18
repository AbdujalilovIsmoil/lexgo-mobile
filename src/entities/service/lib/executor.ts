// Who performs a service → i18n key under dc1.executor (the catalogue mixes
// codes and Cyrillic labels; anything unknown is shown as the backend wrote it).
const MAP: [RegExp, string][] = [
  [/call_center|navbatchi/i, "duty"],
  [/ai_lawyer|ai\+|фақат\s*ai/i, "ai"],
  [/document_constructor|konstruktor/i, "constructor"],
  [/yurist.*advokat|юрист\s*\/\s*адвокат/i, "both"],
  [/advokat|адвокат/i, "advokat"],
  [/yurist|юрист/i, "yurist"],
];

export function executorKey(type?: string): string {
  const t = (type ?? "").trim();
  if (!t) return "";
  return MAP.find(([re]) => re.test(t))?.[1] ?? "";
}
