import { useCallback, useEffect } from "react";
import { kindOf, useDownload } from "@/shared/lib/download";

// path: API path / absolute URL to download (with the token for our API),
// or uri: an already-local file (a freshly picked or recorded file).
export type FileRef = { path?: string; uri?: string; name?: string; mime?: string };

export function useFileSource(file: FileRef | null) {
  const { state, start, cancel } = useDownload();
  const path = file?.path;
  const name = file?.name;
  const mime = file?.mime;
  useEffect(() => {
    if (path) void start({ path, name, mime });
  }, [path, name, mime, start]);
  const retry = useCallback(() => path && void start({ path, name, mime }), [path, name, mime, start]);
  const uri = file?.uri ?? state.uri ?? null;
  const shown = file?.uri ? ({ phase: "done", progress: 1, name: file.name } as const) : state;
  return { state: shown, uri, kind: kindOf(shown.name ?? name ?? uri ?? "", mime), retry, cancel };
}
