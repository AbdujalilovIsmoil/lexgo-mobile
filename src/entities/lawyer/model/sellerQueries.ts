import { useQuery } from "@tanstack/react-query";
import { getCandidates, getOfferedServiceIds, listServiceSellers } from "../api/sellerApi";

export const useServiceSellers = (serviceId: string) =>
  useQuery({ queryKey: ["service-sellers", serviceId], queryFn: () => listServiceSellers(serviceId), enabled: !!serviceId, staleTime: 60 * 1000 });

export const useOfferedServiceIds = (lawyerUserId: string) =>
  useQuery({ queryKey: ["offered-service-ids", lawyerUserId], queryFn: () => getOfferedServiceIds(lawyerUserId), enabled: !!lawyerUserId, staleTime: 60 * 1000 });

export const useCandidates = (serviceId: string, region: string) =>
  useQuery({ queryKey: ["match-candidates", serviceId, region], queryFn: () => getCandidates(serviceId, region), enabled: !!serviceId, staleTime: 60 * 1000 });
