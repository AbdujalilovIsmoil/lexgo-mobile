import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { listMethods } from "./api";

export const methodsKey = ["pay-methods"] as const;

export const useMethods = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: methodsKey, queryFn: listMethods, enabled: authed, staleTime: 60 * 1000 });
};
