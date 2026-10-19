import { useCallback, useEffect } from "react";
import { classifyFile, useDownload } from "@/shared/lib/download";

// path: API path / absolute URL to download (with the token for our API),
// or uri: an already-local file (a freshly picked or recorded file).
export type FileRef = { path?: string; uri?: string; name?: string; mime?: string };

function lastSegment(uri: string): string {
  const seg = uri.split("?")[0].split("/").pop() ?? "";
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

export function useFileSource(file: FileRef | null) {
  const { state, start, cancel } = useDownload();
  const path = file?.path;
  const name = file?.name;
  const mime = file?.mime;
  // A name that is already known to be unsafe is refused before anything is downloaded.
  const allowed = !name || classifyFile(name, mime).safe;
  useEffect(() => {
    if (path && allowed) void start({ path, name, mime });
  }, [path, name, mime, start, allowed]);
  const retry = useCallback(() => path && allowed && void start({ path, name, mime }), [path, name, mime, start, allowed]);
  const uri = file?.uri ?? state.uri ?? null;
  const shown = file?.uri ? ({ phase: "done", progress: 1, name: file.name } as const) : state;
  const fileName = file?.uri ? (file.name ?? lastSegment(file.uri)) : (name ?? shown.name ?? "");
  // The raw name decides (it may hold traversal / double-extension tricks that safeName would hide).
  const cls = classifyFile(fileName, mime);
  return { state: shown, uri: allowed ? uri : null, cls, kind: cls.kind, retry, cancel };
}
