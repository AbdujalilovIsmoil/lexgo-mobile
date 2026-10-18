import { humanizeSlug } from "@/shared/lib/format";

type Tr = (key: string) => string;
/** Call status in words; an unknown backend status is tidied instead of showing a raw key. */
export function csLabel(t: Tr, status: string): string {
  const key = `admMeet.cs.${status}`;
  const v = t(key);
  return v === key ? humanizeSlug(status) : v;
}
