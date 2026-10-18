// "Where is the assistant?" — the only case in which the assistant may point at its own button.
const SUBJECT = ["ai instruktor", "ai instructor", "yordamchi", "instruktor", "instructor", "assistant", "assistent", "ассистент", "помощник", "инструктор"];
const PLACE = ["qayer", "och", "top", "ko'rsat", "korsat", "tugma", "button", "where", "open", "find", "show", "где", "найти", "откры", "показ", "кнопк"];
const DOMAIN = ["tarif", "paket", "obuna", "hujjat", "ariza", "advokat", "yurist", "support", "operator", "subscription", "document", "lawyer", "тариф", "подписк", "документ", "адвокат", "юрист", "оператор"];
const LAUNCHER = ["dashboard.ai-instructor.open", "button:open-instructor", "ai-help:current-page"];

const norm = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[ʻʼ‘’`´]/g, "'").replace(/\s+/g, " ").trim();
const has = (text: string, list: string[]) => list.some((w) => text.includes(w));

export function selfHelpAsked(message: string): boolean {
  const t = norm(message);
  return has(t, SUBJECT) && has(t, PLACE) && !has(t, DOMAIN);
}

export const isLauncherTarget = (id: string): boolean => LAUNCHER.includes(id.trim());
