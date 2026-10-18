import type { Version } from "../model/types";
import { normStatus } from "./normStatus";
import { isDict, personOf, pick, text, when } from "./norm";

export function versionText(v: unknown): string {
  if (isDict(v)) return versionText(v.version ?? v.version_label ?? v.version_number ?? v.number);
  const s = pick(v).replace(/^v(?=\d)/i, "");
  return s.length <= 16 ? s : "";
}

export function normVersion(raw: unknown, i: number): Version | null {
  if (typeof raw === "string" || typeof raw === "number") {
    const version = versionText(raw);
    return version ? { key: `v${version}-${i}`, id: "", version, status: "", content: "", createdAt: "", author: "", source: "", fileName: "", note: "" } : null;
  }
  if (!isDict(raw)) return null;
  const version = versionText(raw);
  const content = text(raw.content, raw.text, raw.body, raw.content_text, raw.extracted_text);
  const createdAt = when(raw.created_at, raw.createdAt, raw.updated_at, raw.published_at, raw.at, raw.date);
  if (!version && !content && !createdAt) return null;
  const file = isDict(raw.file) ? raw.file : {};
  const id = pick(raw.id, raw.version_id, raw.uuid);
  const rs = pick(raw.status, raw.state);
  return {
    key: id || `v${version || i}-${i}`, id, version, status: rs || typeof raw.is_active === "boolean" ? normStatus(rs, raw.is_active) : "", content, createdAt,
    author: personOf(raw.created_by ?? raw.author ?? raw.updated_by ?? raw.created_by_name ?? raw.user),
    source: pick(raw.source, raw.source_type, raw.origin, raw.kind).toLowerCase(),
    fileName: pick(raw.file_name, raw.filename, raw.original_filename, raw.source_file, file.name, file.filename),
    note: pick(raw.note, raw.change_note, raw.comment, raw.changelog, raw.summary),
  };
}
