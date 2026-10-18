import type { CallType, Participant } from "./types";

// A meeting from GET /calls/invited — everything this account hosted or was invited to.
export type Invited = { roomId: string; callId: string; type: CallType; title: string; callerName: string; callerId: string; status: string; callStatus: string; startedAt: string; autoEndAt: string };

export type AdminCall = { id: string; workId: string; status: string; title: string; type: CallType; roomId: string; creatorId: string; creatorName: string; participants: number; durationSec: number; startedAt: string; endedAt: string };
export type AdminCallDetail = { call: AdminCall; roomTitle: string; creator: { name: string; phone: string } | null; durationMin: number; participants: Participant[] };
