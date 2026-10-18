import type { RegDetail, VerifyItem } from "./types";

export type FourStep = "phone" | "identity" | "practice" | "rules";
export type StepState = "done" | "pending" | "rejected";
export const FOUR_STEPS: FourStep[] = ["phone", "identity", "practice", "rules"];

// The backend only names a check; each LexGo step is recognised by these tokens (same table as the web).
const ALIASES: Record<FourStep, string[]> = {
  phone: ["phone", "sms", "otp", "telefon", "телефон", "nomer", "номер"],
  identity: ["identity", "kyc", "passport", "id", "document", "shaxs", "личност", "паспорт", "hujjat", "документ"],
  practice: ["practice", "professional", "profile", "qualification", "license", "licence", "kasbiy", "профил", "квалиф", "лиценз", "malaka"],
  rules: ["rules", "rule", "policy", "terms", "agreement", "consent", "qoida", "qoid", "правил", "соглас"],
};

const isDone = (status: string): boolean => {
  const s = status.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!s || /reject|fail|declin|pending|wait|not_verified|unverified|in_progress|requested/.test(s)) return false;
  return /approv|verified|complete|passed|confirmed|accepted|success/.test(s);
};

// Short aliases ("id") must match a whole word, longer ones may match inside it.
function matches(item: VerifyItem, aliases: string[]): boolean {
  const text = `${item.key} ${item.label}`.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ");
  const tokens = new Set(text.split(" ").filter(Boolean));
  return aliases.some((a) => (a.length <= 2 ? tokens.has(a) : text.includes(a)));
}

export function stepState(detail: RegDetail, step: FourStep): StepState {
  const status = detail.items.find((i) => matches(i, ALIASES[step]))?.status.toLowerCase() ?? "";
  if (/reject|fail|declin/.test(status)) return "rejected";
  return isDone(status) ? "done" : "pending";
}

// "Accept" is only possible once all four steps are done.
export const fourStepsDone = (detail: RegDetail): boolean => FOUR_STEPS.every((s) => stepState(detail, s) === "done");
