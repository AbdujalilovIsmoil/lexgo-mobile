import type { Limits } from "@/entities/pro-files";
import type { Picked } from "@/shared/lib/upload";

const VIDEO = /\.(mp4|mov|webm)$/i;
const MB = 1024 * 1024;

export type Verdict = { ok: Picked[]; bad: { name: string; reason: "badType" | "tooBig"; mb: number }[] };

// Server policy check (GET /platform/policies): allowed / blocked extensions and the file / video size caps.
export function validate(files: Picked[], lim: Limits | undefined): Verdict {
  const ok: Picked[] = [];
  const bad: Verdict["bad"] = [];
  for (const f of files) {
    const ext = `.${f.name.split(".").pop()?.toLowerCase() ?? ""}`;
    const cap = VIDEO.test(f.name) ? lim?.videoMaxMb : lim?.fileMaxMb;
    if (lim && (lim.blocked.includes(ext) || (lim.allowed.length > 0 && !lim.allowed.includes(ext)))) bad.push({ name: f.name, reason: "badType", mb: 0 });
    else if (cap && f.size > cap * MB) bad.push({ name: f.name, reason: "tooBig", mb: cap });
    else ok.push(f);
  }
  return { ok, bad };
}
