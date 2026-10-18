import type { StudioComment, StudioDetail } from "@/entities/admin-studio";

const BACK = /change|reject|declin|return|rework/;
export type ReviewNote = { text: string; by: string; at: string; rejected: boolean };

// The reviewer's last note when work came back: the newest sent-back step comment, else the newest staff comment.
export function reviewNoteOf(d: StudioDetail | null, comments: StudioComment[]): ReviewNote | null {
  if (!d) return null;
  const step = d.steps.filter((s) => BACK.test(s.status) && s.comment).sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))[0];
  if (step) return { text: step.comment, by: step.decidedBy, at: step.decidedAt, rejected: /reject|declin/.test(step.status) };
  const c = [...comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).find((x) => /review|publish|admin/.test(x.authorRole.toLowerCase()));
  return c ? { text: c.text, by: c.author, at: c.createdAt, rejected: false } : null;
}
