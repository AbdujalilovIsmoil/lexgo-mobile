import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { listTemplates } from "../api/templateApi";

export const useTemplates = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: ["doc-templates"], queryFn: listTemplates, enabled: authed, staleTime: 10 * 60 * 1000 });
};
