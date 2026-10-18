// POST /sos → the request and, when an advocate is on duty, the chat room opened for it.
export type SosRequest = {
  id: string;
  status: string;
  category: string;
  dutyName?: string;
  roomId?: string;
  createdAt: string;
};

export type SosCategory = "arrest" | "police" | "court" | "search" | "contract" | "other";

export const SOS_CATEGORIES: { key: SosCategory; icon: "shield" | "alert-triangle" | "briefcase" | "search" | "file-text" | "message-circle" }[] = [
  { key: "arrest", icon: "shield" },
  { key: "police", icon: "alert-triangle" },
  { key: "court", icon: "briefcase" },
  { key: "search", icon: "search" },
  { key: "contract", icon: "file-text" },
  { key: "other", icon: "message-circle" },
];
