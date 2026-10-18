import { useQuery } from "@tanstack/react-query";
import { getAid, listAid } from "../api/aidApi";

export const aidKeys = { all: ["admin-aid"] as const };

export const useAidList = () => useQuery({ queryKey: [...aidKeys.all, "list"], queryFn: listAid });
export const useAidDetail = (id: string | null) => useQuery({ queryKey: [...aidKeys.all, "detail", id], queryFn: () => getAid(id ?? ""), enabled: !!id });
