import type { Work, WorkKind } from "./types";

export type WorkFile = { id: string; name: string; mime: string; size: number; path: string; role: "result" | "upload" };
export type WorkEvent = { key: string; status: string; at: string; note: string };
export type WorkPayment = { amount: number; currency: string; status: string; paid: boolean; required: boolean };

// The 15-minute rating window as the server reports it (TZ 25).
export type WorkRating = {
  available: boolean;
  submitted: boolean;
  deadlineAt: string;
  remainingSeconds: number;
  closedReason: string;
  stars: number;
  comment: string;
  ratedAt: string;
};

export type WorkComplaint = {
  id: string;
  workId: string;
  status: string;
  reason: string;
  text: string;
  operatorNote: string;
  resolvedAction: string;
  createdAt: string;
};

// Facts a work may carry; the label of each is cl4.info.<key>.
export type InfoKey = "need" | "channel" | "region" | "minutes" | "result" | "statusNote" | "service" | "preferredTime" | "caseNumber" | "stage" | "description" | "deadline" | "docType" | "fileName";

export type WorkDetail = {
  work: Work;
  roomId: string;
  callId: string;
  payment: WorkPayment | null;
  timeline: WorkEvent[];
  files: WorkFile[];
  rating: WorkRating | null;
  complaints: WorkComplaint[];
  related: { kind: WorkKind; id: string } | null;
  info: Partial<Record<InfoKey, string>>;
};
