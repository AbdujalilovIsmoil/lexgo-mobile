import { useQuery } from "@tanstack/react-query";
import { listAcademyCourses } from "../api/academyApi";

export const academyKeys = { catalog: ["academy", "catalog"] as const };

export const useAcademyCourses = () => useQuery({ queryKey: academyKeys.catalog, queryFn: listAcademyCourses, staleTime: 5 * 60 * 1000 });
