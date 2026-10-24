import { useQuery } from "@tanstack/react-query";
import { listCategoryTree, listMyExperience } from "../api/experienceApi";

export const expKeys = { mine: ["pro-experience"] as const, categories: ["exp-categories"] as const };

export const useMyExperience = () => useQuery({ queryKey: expKeys.mine, queryFn: listMyExperience, staleTime: 30 * 1000 });
export const useExpCategories = () => useQuery({ queryKey: expKeys.categories, queryFn: listCategoryTree, staleTime: 60 * 60 * 1000 });
