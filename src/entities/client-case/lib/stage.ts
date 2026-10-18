// The 5 simplified client steps of an order; lost / cancelled / declined sit outside the track.
export const CLIENT_STAGES = ["request", "matching", "payment", "work", "done"] as const;
export type ClientStage = (typeof CLIENT_STAGES)[number] | "closed";

const OF: Record<string, ClientStage> = {
  new: "request", waiting_info: "request", waiting_docs: "request",
  seller_selection: "matching", sent_to_seller: "matching", accepted: "matching",
  waiting_payment: "payment",
  paid: "work", started: "work", in_progress: "work", result_ready: "work", quality_check: "work",
  delivered: "done", client_confirmation: "done", completed: "done", rated: "done",
  lost: "closed", cancelled: "closed", canceled: "closed", declined: "closed",
};

export const clientStageOf = (status: string): ClientStage | null => OF[status.trim().toLowerCase()] ?? null;

// Mirror of ORDER_TRANSITIONS the client may trigger (S-22): finish a delivered order, or cancel before work starts.
const TRANSITIONS: Record<string, string[]> = {
  new: ["cancelled"], waiting_info: ["cancelled"], waiting_docs: ["cancelled"], waiting_payment: ["cancelled"], seller_selection: ["cancelled"],
  delivered: ["completed"], client_confirmation: ["completed"],
};
export const clientMoves = (status: string): string[] => TRANSITIONS[status.trim().toLowerCase()] ?? [];
