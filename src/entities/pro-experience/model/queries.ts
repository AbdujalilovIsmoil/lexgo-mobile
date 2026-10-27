import { useQuery } from "@tanstack/react-query";
import { getExperienceHistory, listCategoryTree, listMyExperience } from "../api/experienceApi";

export const expKeys = {
  all: ["pro-experience"] as const, // the list and every history: what a submission, a withdrawal or a decision changes
  mine: ["pro-experience", "mine"] as const,
  history: (id: string) => ["pro-experience", "history", id] as const,
  categories: ["exp-categories"] as const,
};

export const useMyExperience = () => useQuery({ queryKey: expKeys.mine, queryFn: listMyExperience, staleTime: 30 * 1000 });
// Read only while its sheet is open.
export const useExpHistory = (id: string, enabled: boolean) => useQuery({ queryKey: expKeys.history(id), queryFn: () => getExperienceHistory(id), enabled: enabled && !!id, staleTime: 30 * 1000 });
export const useExpCategories = () => useQuery({ queryKey: expKeys.categories, queryFn: listCategoryTree, staleTime: 60 * 60 * 1000 });
