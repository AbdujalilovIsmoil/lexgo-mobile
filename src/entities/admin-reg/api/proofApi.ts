import { File, Paths } from "expo-file-system";
import { API_BASE } from "@/shared/config/env";
import { accessToken } from "@/shared/api";

export type ProofFile = { uri: string; mime: string };

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/heic": "heic", "application/pdf": "pdf" };

// Content-Type can be generic; fall back to the file's magic bytes.
function sniff(b: Uint8Array): string {
  if (b[0] === 0x25 && b[1] === 0x50) return "application/pdf";
  if (b[0] === 0xff && b[1] === 0xd8) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50) return "image/png";
  if (b[0] === 0x47 && b[1] === 0x49) return "image/gif";
  return b[8] === 0x57 && b[9] === 0x45 ? "image/webp" : "application/octet-stream";
}

// GET /admin/lawyer-proof-documents/{id}/file?disposition=inline — needs the bearer token, so it is
// fetched here and saved to the cache; the caller shows images or hands PDFs to the share sheet.
export async function fetchProof(docId: string): Promise<ProofFile> {
  const token = accessToken();
  const res = await fetch(`${API_BASE}/admin/lawyer-proof-documents/${encodeURIComponent(docId)}/file?disposition=inline`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error(`proof_${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const declared = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const mime = EXT[declared] ? declared : sniff(bytes);
  const file = new File(Paths.cache, `proof-${docId.slice(0, 12)}.${EXT[mime] ?? "bin"}`);
  file.create({ overwrite: true });
  file.write(bytes);
  return { uri: file.uri, mime };
}
