import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { getComplaint, listComplaints, resolveComplaint } from "../api/complaintApi";
import { ccKeys } from "./keys";
import { useLiveMs } from "./useLiveMs";

// New complaints should show up without a manual reload (the web listens for quality_complaint.* events).
export const useComplaints = (status: string) =>
  useQuery({ queryKey: [...ccKeys.complaints, "list", status], queryFn: () => listComplaints(status), refetchInterval: useLiveMs(20_000) });

export const useComplaint = (id: string) => useQuery({ queryKey: [...ccKeys.complaints, "one", id], queryFn: () => getComplaint(id), enabled: !!id });

export const useResolveComplaint = () => useAdminMutation({ mutationFn: resolveComplaint, invalidate: [ccKeys.complaints], success: "admCcB.cResolved" });
