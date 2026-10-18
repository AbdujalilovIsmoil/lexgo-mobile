import { asDict, asStr } from "@/shared/lib/json";
import { hrmList } from "./core";

const PAGE = 100; // the web caps a page at 100 rows

// Reads every page of a list endpoint (limit/offset like the web); stops on a short page or when a page brings no new ids.
export async function hrmListAll(path: string, p: Record<string, string | undefined>): Promise<unknown[]> {
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (let offset = 0; offset < PAGE * 20; offset += PAGE) {
    const rows = await hrmList(path, { ...p, limit: PAGE, offset });
    const fresh = rows.filter((r) => {
      const id = asStr(asDict(r).id);
      if (!id) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    out.push(...fresh);
    if (rows.length < PAGE || !fresh.length) break;
  }
  return out;
}
