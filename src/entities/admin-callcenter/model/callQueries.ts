import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { listCalls, logCall } from "../api/callApi";
import { ccKeys } from "./keys";

// The operator's call log; with a client id only the contacts with that client.
export const useCalls = (clientUserId = "") => useQuery({ queryKey: [...ccKeys.calls, "list", clientUserId], queryFn: () => listCalls(clientUserId), retry: false });

export const useLogCall = () => useAdminMutation({ mutationFn: logCall, invalidate: [ccKeys.calls], success: "admCcC.callLogged" });
