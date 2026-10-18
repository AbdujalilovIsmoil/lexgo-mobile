import { useQuery } from "@tanstack/react-query";
import { getAiStatus, getReadiness } from "../api/systemApi";

export const systemKeys = { all: ["admin-system"] as const };
export const useReadiness = () => useQuery({ queryKey: [...systemKeys.all, "e2e"], queryFn: getReadiness });
export const useAiStatus = () => useQuery({ queryKey: [...systemKeys.all, "ai"], queryFn: getAiStatus });
