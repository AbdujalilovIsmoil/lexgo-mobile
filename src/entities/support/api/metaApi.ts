import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { MetaOption, SupportMeta } from "../model/types";

const options = (v: unknown): MetaOption[] =>
  asArr(v)
    .map((x) => (typeof x === "string" ? { key: x.trim(), label: "" } : { key: asStr(asDict(x).key ?? asDict(x).value).trim(), label: asStr(asDict(x).label).trim() }))
    .filter((o) => o.key);

// GET /support/meta — the categories / priorities the backend accepts.
export async function getSupportMeta(): Promise<SupportMeta> {
  const d = asDict(await http("/support/meta"));
  return { categories: options(d.categories), priorities: options(d.priorities) };
}


