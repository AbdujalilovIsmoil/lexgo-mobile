import { catChoiceOf, latestVersion, nextVersion, type Reglament, type RStatus } from "@/entities/admin-aireg";

export type Form = { target: string; title: string; choice: string; custom: string; version: string; status: RStatus; content: string; base: Reglament | null };

export function seedNew(content: string, category: string, title = "", version = "1.0"): Form {
  const c = catChoiceOf(category);
  return { target: "", title, choice: c.choice, custom: c.custom, version, status: "active", content, base: null };
}

// An existing reglament as the start of its next version (the new text can be appended to the old one).
export function seedFrom(r: Reglament, extra: string): Form {
  const c = catChoiceOf(r.category);
  const latest = latestVersion(r);
  const body = r.content ? (extra ? `${r.content.trimEnd()}\n\n${extra}` : r.content) : extra;
  return { target: r.id, title: r.title, choice: c.choice, custom: c.custom, version: latest ? nextVersion(latest) : "1.0", status: r.status, content: body, base: r };
}

// The part of the text the user added on top of the base reglament (kept when switching target).
export function extraOf(f: Form): string {
  const base = f.base?.content.trimEnd() ?? "";
  return !base || !f.content.startsWith(base) ? f.content : f.content.slice(base.length).replace(/^\s+/, "");
}
