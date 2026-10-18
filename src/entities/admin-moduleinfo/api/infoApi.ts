import { http } from "@/shared/api";
import { asArr, asDict, asStr } from "@/shared/lib/json";
import type { ModuleInfo } from "../model/types";

const lines = (v: unknown) => asArr(v).map((x) => (typeof x === "string" ? x : asStr(asDict(x).description ?? asDict(x).path ?? asDict(x).title ?? asDict(x).name ?? JSON.stringify(x)))).filter(Boolean);

// GET /approvals/info, /legal-aid/info — the backend's own description of a module (purpose, when records appear, status flow).
export async function getModuleInfo(path: string): Promise<ModuleInfo> {
  const d = asDict(await http(path));
  return {
    title: asStr(d.title), purpose: asStr(d.purpose), note: asStr(d.frontend_note),
    sections: [d.used_for, d.created_when, d.status_flow, d.main_endpoints].map((v, i) => ({ key: ["usedFor", "createdWhen", "statusFlow", "endpoints"][i], lines: lines(v) })).filter((s) => s.lines.length),
  };
}
