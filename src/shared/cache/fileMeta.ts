import { cacheGet, cacheList, cacheSet, DAY } from "./kv";

// Metadata of a file the user opened or downloaded (never its content and never a signed URL).
export type FileMeta = { id: string; name: string; mime?: string; size?: number; path?: string; openedAt: number };

export const rememberFile = (m: Omit<FileMeta, "openedAt">): Promise<void> => cacheSet(`file:${m.id}`, { ...m, openedAt: Date.now() }, 30 * DAY);
export const getFileMeta = (id: string): Promise<FileMeta | null> => cacheGet<FileMeta>(`file:${id}`);
export async function recentFiles(limit = 20): Promise<FileMeta[]> {
  return (await cacheList<FileMeta>("file:")).slice(0, limit).map((r) => r.value);
}
