import { asArr } from "@/shared/lib/json";
import { compareVersions } from "../model/versions";
import type { Reglament, Version } from "../model/types";
import { isDict, personOf, pick, text, when } from "./norm";
import { normStatus } from "./normStatus";
import { normVersion, versionText } from "./normVersion";

function unwrap(raw: Record<string, unknown>): Record<string, unknown> {
  if ("title" in raw || "id" in raw || "reglament_id" in raw) return raw;
  for (const k of ["reglament", "item", "data", "result"]) {
    const inner = raw[k];
    if (isDict(inner) && ("title" in inner || "id" in inner || "reglament_id" in inner || "name" in inner)) return inner;
  }
  return raw;
}

// A reglament in whatever shape the backend sends it (versions inline or not, status words, nesting).
export function normReglament(input: unknown): Reglament | null {
  if (!isDict(input)) return null;
  const d = unwrap(input);
  const cur = [d.current_version, d.latest_version, d.active_version, d.version, input.version].find(isDict) ?? {};
  const listed = ["versions", "history", "version_history"].map((k) => d[k] ?? input[k]).find(Array.isArray);
  const versions = asArr(listed).map(normVersion).filter((v): v is Version => v !== null).sort((a, b) => compareVersions(b.version, a.version));
  const id = pick(d.id, d.reglament_id, d.uuid, d._id, cur.reglament_id);
  const title = pick(d.title, d.name, cur.title);
  if (!id && !title) return null;
  const version = versionText(d.current_version) || versionText(d.version) || versionText(d.latest_version) || versionText(d.active_version) || versionText(cur) || versions[0]?.version || "";
  const match = versions.find((v) => v.version === version);
  const file = isDict(d.file) ? d.file : {};
  const statusRaw = pick(d.status, d.state, cur.status);
  return {
    id, title: title || id, category: pick(d.category, d.category_slug, d.type, d.kind, cur.category).toLowerCase(), version, status: normStatus(statusRaw, d.is_active ?? cur.is_active), statusRaw,
    content: text(d.content, d.text, d.body, d.content_text, d.extracted_text, cur.content, cur.text, cur.body) || match?.content || "",
    updatedAt: when(d.updated_at, d.updatedAt, cur.created_at, cur.updated_at, d.created_at) || match?.createdAt || versions[0]?.createdAt || "",
    createdAt: when(d.created_at, d.createdAt) || versions[versions.length - 1]?.createdAt || "",
    author: personOf(d.updated_by ?? d.created_by ?? d.author ?? cur.created_by ?? d.updated_by_name ?? d.created_by_name),
    source: pick(d.source, d.source_type, cur.source, cur.source_type).toLowerCase(),
    fileName: pick(d.file_name, d.filename, d.original_filename, cur.file_name, cur.filename, file.name, file.filename),
    versions,
  };
}

// Fill gaps of a list row with the fuller detail response.
export function mergeReglament(base: Reglament, more: Reglament | null): Reglament {
  if (!more) return base;
  return { ...base, title: more.title || base.title, category: more.category || base.category, version: more.version || base.version, status: more.statusRaw ? more.status : base.status, statusRaw: more.statusRaw || base.statusRaw, content: more.content || base.content, updatedAt: more.updatedAt || base.updatedAt, createdAt: more.createdAt || base.createdAt, author: more.author || base.author, source: more.source || base.source, fileName: more.fileName || base.fileName, versions: more.versions.length ? more.versions : base.versions };
}

export const needsDetails = (r: Reglament) => Boolean(r.id) && (!r.content || !r.versions.length);
