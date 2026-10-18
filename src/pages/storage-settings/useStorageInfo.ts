import { useQuery } from "@tanstack/react-query";
import { cacheStats, dirBytes } from "@/shared/cache";
import { filesDir } from "@/shared/lib/download";

export const storageKey = ["storage-info"] as const;

// Cache rows + database file + downloaded documents, read on demand (never persisted).
export function useStorageInfo() {
  return useQuery({
    queryKey: storageKey,
    queryFn: async () => {
      const cache = await cacheStats();
      return { cache, files: dirBytes(filesDir()) };
    },
    staleTime: 0,
    gcTime: 0,
  });
}
