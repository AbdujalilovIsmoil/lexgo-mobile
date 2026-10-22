import { DocPaper } from "./DocPaper";

// The server's filled-in text laid out as a page: spots still empty arrive as "[label]" and are drawn as numbered blue fields, so the client sees
// what is missing (see DocPaper). `kicker` is the letterhead line (the category).
export function PreviewText({ text, fade, large, slotTotal, kicker }: { text: string; fade?: boolean; large?: boolean; slotTotal?: number; kicker?: string }) {
  return <DocPaper text={text} fade={fade} large={large} slotTotal={slotTotal} kicker={kicker} />;
}
