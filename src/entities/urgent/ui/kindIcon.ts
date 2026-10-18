import type { IconName } from "@/shared/ui";

// One icon per service, wherever it is shown.
const ICON: Record<string, IconName> = {
  video_consultation: "video",
  express_video_consultation: "zap",
  traffic_accident_consultation: "alert-triangle",
  chat_consultation: "message-circle",
  second_opinion_single: "user-check",
  second_opinion_group: "users",
};
export const kindIcon = (kind: string): IconName => ICON[kind] ?? "briefcase";

// One colour per service, so a box is recognised before it is read.
const KIND_TINT: Record<string, string> = {
  video_consultation: "#1668F0", express_video_consultation: "#E0457F", traffic_accident_consultation: "#F59E0B",
  chat_consultation: "#00A870", second_opinion_single: "#7A5CFF", second_opinion_group: "#7A5CFF",
};
export const kindTint = (kind: string): string => KIND_TINT[kind] ?? "#5C6E85";

const TINT: Record<string, string> = { open_pool: "#3B82F6", claimed: "#8B5CF6", scheduled: "#F59E0B", in_progress: "#8B5CF6", meeting_active: "#10B981", completed: "#10B981", cancelled: "#EF4444", expired: "#94A3B8" };
export const statusTint = (status: string): string => TINT[status] ?? "#3B82F6";
