import { fmtDate } from "@/shared/lib/format";
import type { Msg } from "@/entities/secure-chat";

export type Item = { kind: "msg"; msg: Msg } | { kind: "day"; key: string; label: string } | { kind: "new"; n: number };
type Tr = (key: string) => string;

const dayKey = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toDateString();
};

function dayLabel(iso: string, t: Tr, locale: string): string {
  const key = dayKey(iso);
  if (key === new Date().toDateString()) return t("admChat.today");
  if (key === new Date(Date.now() - 86_400_000).toDateString()) return t("admChatB.yesterday");
  return fmtDate(iso, locale);
}

/** Newest-first rows for an inverted list: a day label above the first message of each day and the "new messages" divider above the first unread one. */
export function buildItems(msgs: Msg[], t: Tr, locale: string, divider = ""): Item[] {
  const out: Item[] = [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    out.push({ kind: "msg", msg: msgs[i] });
    if (msgs[i].id === divider) out.push({ kind: "new", n: msgs.length - i });
    const day = dayKey(msgs[i].createdAt);
    if (day && (i === 0 || dayKey(msgs[i - 1].createdAt) !== day)) out.push({ kind: "day", key: day, label: dayLabel(msgs[i].createdAt, t, locale) });
  }
  return out;
}

export const itemKey = (it: Item): string => (it.kind === "msg" ? it.msg.id : it.kind === "day" ? `day-${it.key}` : "new-divider");
