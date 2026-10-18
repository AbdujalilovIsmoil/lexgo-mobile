import { useCallback, useEffect, useRef, useState } from "react";
import { File } from "expo-file-system";
import { API_BASE } from "@/shared/config/env";
import { accessToken } from "@/shared/api";
import { filesDir } from "./cache";
import { safeName } from "./fileName";

export type DownloadSource = { path: string; name?: string; mime?: string };
export type DownloadState = { phase: "idle" | "loading" | "done" | "error"; progress: number; uri?: string; name?: string; error?: string };
const IDLE: DownloadState = { phase: "idle", progress: 0 };

// API paths get the bearer token and the API origin; absolute URLs are fetched as-is
// (no token leaks to foreign hosts). Progress 0..1, cancel(), name sanitised.
export function useDownload() {
  const [state, setState] = useState<DownloadState>(IDLE);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);

  const start = useCallback(async (src: DownloadSource): Promise<string | null> => {
    abort.current?.abort();
    const ctl = new AbortController();
    abort.current = ctl;
    setState({ phase: "loading", progress: 0 });
    try {
      const own = !/^https?:/i.test(src.path) || src.path.startsWith(API_BASE);
      const url = /^https?:/i.test(src.path) ? src.path : `${API_BASE}${src.path.startsWith("/") ? "" : "/"}${src.path}`;
      const token = accessToken();
      const dir = filesDir();
      if (!dir.exists) dir.create({ intermediates: true });
      const target = src.name ? new File(dir, `${Date.now()}-${safeName(src.name)}`) : dir;
      const file = await File.downloadFileAsync(url, target, {
        headers: own && token ? { Authorization: `Bearer ${token}` } : {},
        idempotent: true,
        signal: ctl.signal,
        onProgress: (p) => p.totalBytes > 0 && setState({ phase: "loading", progress: p.bytesWritten / p.totalBytes }),
      });
      setState({ phase: "done", progress: 1, uri: file.uri, name: src.name ? safeName(src.name) : safeName(file.name) });
      return file.uri;
    } catch (e) {
      if (!ctl.signal.aborted) setState({ phase: "error", progress: 0, error: e instanceof Error ? e.message : "download_failed" });
      else setState(IDLE);
      return null;
    }
  }, []);

  const cancel = useCallback(() => abort.current?.abort(), []);
  return { state, start, cancel };
}
