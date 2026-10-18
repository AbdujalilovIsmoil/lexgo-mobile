import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { listGifts } from "./api";

export const giftsKey = ["gifts"] as const;

export const useGifts = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: giftsKey, queryFn: listGifts, enabled: authed, staleTime: 60 * 1000 });
};
