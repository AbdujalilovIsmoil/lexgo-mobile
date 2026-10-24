import { File } from "expo-file-system";
import { filesDir } from "./download/cache";
import * as Sharing from "expo-sharing";
import { API_BASE, isApiUrl } from "@/shared/config/env";
import { accessToken } from "@/shared/api";

const safe = (name: string) => name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "file";

// Downloads a file that needs the bearer token (an export, a proof document)
// into the cache and returns its local uri. The token goes to our API only: an absolute URL on another host is fetched without it.
export async function downloadAuthed(path: string, name: string): Promise<string> {
  const absolute = /^https?:/i.test(path);
  const url = absolute ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const token = accessToken();
  const dir = filesDir(); // wiped on sign-out: an export or a proof document must not outlive the session
  if (!dir.exists) dir.create({ intermediates: true });
  const file = await File.downloadFileAsync(url, new File(dir, safe(name)), {
    headers: token && (!absolute || isApiUrl(url)) ? { Authorization: `Bearer ${token}` } : {},
    idempotent: true,
  });
  return file.uri;
}

// Opens the system share sheet (save to Files, send to another app…) for a local file.
export async function shareFile(uri: string, mimeType?: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, mimeType ? { mimeType } : undefined);
}

export async function downloadAndShare(path: string, name: string, mimeType?: string): Promise<void> {
  await shareFile(await downloadAuthed(path, name), mimeType);
}
