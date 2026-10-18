import { Directory, File } from "expo-file-system";

/** "1.4 MB" / "12 KB" / "0 B" */
export function fmtBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  if (n < 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

// Total size of a folder, walking it (the native directory size is not exposed on every platform).
export function dirBytes(dir: Directory): number {
  try {
    if (!dir.exists) return 0;
    return dir.list().reduce((sum, e) => sum + (e instanceof Directory ? dirBytes(e) : (e as File).size ?? 0), 0);
  } catch {
    return 0;
  }
}
