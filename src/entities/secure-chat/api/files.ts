import { File } from "expo-file-system";
import { API_BASE } from "@/shared/config/env";
import { ApiError, accessToken } from "@/shared/api";
import { filesDir, safeName } from "@/shared/lib/download";
import { shareFile } from "@/shared/lib/files";
import { registerSessionReset } from "@/shared/lib/sessionReset";
import type { Msg } from "../model/types";

const done = new Map<string, Promise<string>>();
registerSessionReset(() => done.clear()); // the files themselves are wiped with filesDir()

async function fetchTo(msg: Msg): Promise<string> {
  const path = msg.file?.path ?? "";
  const dir = filesDir(); // wiped on logout / role change (TZ 29: confidential content does not outlive the session)
  if (!dir.exists) dir.create({ intermediates: true });
  const target = new File(dir, `${msg.id.slice(0, 8)}-${safeName(msg.file?.name ?? "", "file")}`);
  if (target.exists) return target.uri;
  const token = accessToken();
  try {
    const file = await File.downloadFileAsync(`${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`, target, { headers: token ? { Authorization: `Bearer ${token}` } : {}, idempotent: true });
    return file.uri;
  } catch {
    throw new ApiError(0, "download_failed");
  }
}

// Downloads an attachment with the bearer token once per message and returns the cached local uri.
export function localFile(msg: Msg): Promise<string> {
  if (!msg.file?.path) return Promise.reject(new Error("no file"));
  const hit = done.get(msg.id);
  if (hit) return hit;
  const run = fetchTo(msg);
  done.set(msg.id, run);
  run.catch(() => done.delete(msg.id));
  return run;
}

// Opens the system share sheet (save to Files, send on) for an attachment.
export async function openFile(msg: Msg): Promise<void> {
  await shareFile(await localFile(msg), msg.file?.mime || undefined);
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|avif|heic|heif)$/i;
export function isImage(msg: Msg): boolean {
  const f = msg.file;
  if (!f || msg.type === "voice") return false;
  const mime = f.mime.toLowerCase();
  if (mime.startsWith("image/")) return true;
  return (!mime || mime.startsWith("application/octet-stream")) && IMAGE_EXT.test(f.name);
}
