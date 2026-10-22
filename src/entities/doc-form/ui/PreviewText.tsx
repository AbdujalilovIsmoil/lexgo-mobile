import { DocPaper } from "./DocPaper";

// The server's filled-in text laid out as a page: spots still empty arrive as "[label]" and are drawn as yellow fields, so the client sees what
// is missing (see DocPaper).
export function PreviewText({ text, fade, large, slotTotal }: { text: string; fade?: boolean; large?: boolean; slotTotal?: number }) {
  return <DocPaper text={text} fade={fade} large={large} slotTotal={slotTotal} />;
}
