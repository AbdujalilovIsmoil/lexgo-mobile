import { useQuery } from "@tanstack/react-query";
import { getDocTypes, getServiceDoc } from "../api/infoApi";

export const dutyKeys = { all: ["duty-request"] as const };

// Optional metadata: a failed load simply means no picker (never an error screen).
export const useDocTypes = () => useQuery({ queryKey: [...dutyKeys.all, "types"], queryFn: getDocTypes, staleTime: 10 * 60_000, retry: false });
export const useServiceDoc = (id: string) => useQuery({ queryKey: [...dutyKeys.all, "service", id], queryFn: () => getServiceDoc(id), enabled: !!id });
