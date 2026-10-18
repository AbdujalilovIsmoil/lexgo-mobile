import { useQuery } from "@tanstack/react-query";
import { getModuleInfo } from "../api/infoApi";

export const useModuleInfo = (path: string, enabled: boolean) => useQuery({ queryKey: ["admin-moduleinfo", path], queryFn: () => getModuleInfo(path), enabled, staleTime: 10 * 60_000 });
