export type StudioActivity = {
  sessionId: string;
  userId: string;
  userName: string;
  role: string;
  code: string;
  objectId: string;
  objectName: string;
  online: boolean;
  startedAt: string;
  lastSeenAt: string;
  endedAt: string;
  durationSec: number;
  saves: number;
};
export type StudioMonitoring = {
  items: StudioActivity[];
  summary: { online: number; sessions: number; users: number; saves: number; objects: number; submitted: number; seconds: number };
  users: { id: string; name: string; sessions: number }[];
};
export type StudioRouteStep = { role: string; title: string };
export type StudioRoute = { id: string; code: string; title: string; steps: StudioRouteStep[]; status: string; updatedAt: string };
export type StudioRouteInput = { code: string; title: string; steps: StudioRouteStep[]; status: string };
export type StudioGrant = { id: string; userId: string; userName: string; phone: string; lexgoId: string; roles: string[]; codes: string[]; active: boolean; createdAt: string };
export type StudioGrantInput = { id?: string; userId: string; roles: string[]; codes: string[]; active: boolean };
export type StudioRef = { value: string; label: string };
export type StudioListQuery = { code?: string; status?: string; mine?: boolean; limit?: number; offset?: number };
export type StudioPage<T> = { items: T[]; total: number };
export type StudioHeartbeat = { sessionId?: string; code: string; objectId?: string; versionId?: string; saves?: number; name?: string };
