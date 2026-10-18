export type Source = { title?: string; url?: string; snippet?: string };

export type Contract = {
  id: string;
  contractType: string;
  status: string;
  downloadUrl: string;
  fileName?: string;
  mimeType?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  contracts?: Contract[];
  createdAt?: string;
  pending?: boolean; // optimistic user bubble, not yet confirmed by the server
  failed?: boolean;
  streaming?: boolean; // assembled from stream fragments, final text not yet received
};

export type Chat = { id: string; title: string; lastMessage?: string; updatedAt?: string };

// Guest AI quota, echoed by the server on guest replies (and inside the 429 body).
// Every number comes from the response: the app never hard-codes a limit.
export type GuestLimit = {
  dailyLimit: number;
  totalLimit: number;
  usedToday: number;
  usedTotal: number;
  remainingToday: number;
  remainingTotal: number;
  registerOffer: boolean;
  registeredFree: number;
  resetsAt?: string;
};

// Why the server refused a question (limit card state).
export type ChatLimit = {
  kind: "guest_daily" | "guest_total" | "quota" | "rate";
  guest?: GuestLimit;
  used?: number;
  monthlyLimit?: number;
  retryAfter?: number;
  message?: string;
};
