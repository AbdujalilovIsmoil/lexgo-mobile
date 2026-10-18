import { useQuery } from "@tanstack/react-query";
import { listPackages } from "../api/packageApi";

export const packageKeys = { all: ["service-packages"] as const };

export const usePackages = () => useQuery({ queryKey: packageKeys.all, queryFn: listPackages, staleTime: 5 * 60 * 1000 });
