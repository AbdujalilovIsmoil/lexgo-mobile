import { useQuery } from "@tanstack/react-query";
import { getLegalCorpus } from "../api/intakeApi";

export const useLegalCorpus = () => useQuery({ queryKey: ["ai-legal-corpus"], queryFn: getLegalCorpus, staleTime: 60 * 60_000 });
