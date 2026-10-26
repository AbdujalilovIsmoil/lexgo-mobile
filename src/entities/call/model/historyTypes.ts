import type { CallType } from "./types";

// A meeting from GET /calls/invited — everything this account hosted or was invited to.
export type Invited = { roomId: string; callId: string; type: CallType; title: string; callerName: string; callerId: string; status: string; callStatus: string; startedAt: string; autoEndAt: string };
