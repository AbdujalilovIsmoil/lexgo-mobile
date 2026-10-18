import { useQuery } from "@tanstack/react-query";
import { getPackageOptions, getServiceOptions } from "../api/priceOptionApi";

export const optionKeys = { service: (id: string) => ["price-options", "service", id] as const, pack: (id: string) => ["price-options", "package", id] as const };

export const useServiceOptions = (id: string, on = true) => useQuery({ queryKey: optionKeys.service(id), queryFn: () => getServiceOptions(id), enabled: !!id && on, staleTime: 60_000 });
export const usePackageOptions = (id: string, on = true) => useQuery({ queryKey: optionKeys.pack(id), queryFn: () => getPackageOptions(id), enabled: !!id && on, staleTime: 60_000 });
