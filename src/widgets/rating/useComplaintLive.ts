import { useUserEvents } from "@/shared/realtime";

const isComplaint = (name: string) => name.startsWith("quality_complaint.") || name.startsWith("complaint.");

// Refetch the list when the backend reports a complaint change (web: subscribeUserEvents + isComplaintEvent).
export function useComplaintLive(refetch: () => void) {
  useUserEvents(["quality_complaint.", "complaint.", "notification.created"], (e) => {
    if (e.event !== "notification.created") return refetch();
    const n = (e.notification ?? {}) as { data?: { event?: string }; meta?: { event?: string } };
    if (isComplaint(String(n.data?.event ?? n.meta?.event ?? ""))) refetch();
  });
}
