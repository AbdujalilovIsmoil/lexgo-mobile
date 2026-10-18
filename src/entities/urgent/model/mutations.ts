import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { cancelOwn, completeChat } from "../api/clientApi";
import { cancel, complete, createMeeting, setStatus, transfer } from "../api/ccApi";
import { urgentKeys } from "./keys";

const inv = [urgentKeys.all];

export const useCancelOwn = () => useAdminMutation({ mutationFn: cancelOwn, invalidate: inv, success: "ug10.cancelled" });
export const useCompleteChat = () => useAdminMutation({ mutationFn: completeChat, invalidate: inv, success: "ug10.chatDone" });
export const useCancelRequest = () => useAdminMutation({ mutationFn: cancel, invalidate: inv, success: "ug10.cancelled" });
export const useCompleteRequest = () => useAdminMutation({ mutationFn: complete, invalidate: inv, success: "ug10.completed" });
export const useTransfer = () => useAdminMutation({ mutationFn: transfer, invalidate: inv, success: "ug10.transferred" });
export const useSetStatus = () => useAdminMutation({ mutationFn: setStatus, invalidate: inv, success: "ug10.moved" });
export const useMeeting = () => useAdminMutation({ mutationFn: createMeeting, invalidate: inv, success: "ug10.meeting" });
