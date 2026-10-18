import { useQuery } from "@tanstack/react-query";
import { listComplaints } from "../api/complaintApi";

export const complaintKeys = { all: ["admin-complaints"] as const };
export const useComplaints = () => useQuery({ queryKey: [...complaintKeys.all, "list"], queryFn: listComplaints });
