import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import type { Dict } from "@/shared/lib/json";
import { addHoliday, getBusinessHours, removeHoliday, simulate } from "../api/calendarApi";
import { getHistory, getPolicies, getReadiness, getUnverifiedMode, putPolicy, setUnverifiedMode } from "../api/policyApi";
import type { PolicySection, UnverifiedMode } from "./types";

export const polKeys = { all: ["admin-policies"] as const };

export const usePolicies = () => useQuery({ queryKey: [...polKeys.all, "sections"], queryFn: getPolicies });
export const useHistory = (section: PolicySection | null) => useQuery({ queryKey: [...polKeys.all, "history", section], queryFn: () => getHistory(section as PolicySection), enabled: !!section });
export const useReadiness = () => useQuery({ queryKey: [...polKeys.all, "readiness"], queryFn: getReadiness });
export const useUnverified = () => useQuery({ queryKey: [...polKeys.all, "unverified"], queryFn: getUnverifiedMode });
export const useBusinessHours = () => useQuery({ queryKey: [...polKeys.all, "hours"], queryFn: getBusinessHours });

// A policy change applies to the whole platform at once and creates a new version.
export const useSavePolicy = () =>
  useAdminMutation({ mutationFn: (v: { section: PolicySection; data: Dict }) => putPolicy(v.section, v.data), invalidate: [polKeys.all], success: "admPol.saved" });

export const useSetUnverified = () =>
  useAdminMutation({ mutationFn: (m: UnverifiedMode) => setUnverifiedMode(m), invalidate: [polKeys.all], success: "admPol.saved" });

export const useAddHoliday = () =>
  useAdminMutation({ mutationFn: (v: { day: string; title: string }) => addHoliday(v.day, v.title), invalidate: [[...polKeys.all, "hours"]], success: "admPol.holidayAdded" });

export const useRemoveHoliday = () =>
  useAdminMutation({ mutationFn: (day: string) => removeHoliday(day), invalidate: [[...polKeys.all, "hours"]], success: "admPol.holidayRemoved" });

export const useSimulate = () => useAdminMutation({ mutationFn: (atIso: string) => simulate(atIso) });
