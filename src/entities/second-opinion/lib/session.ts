import { randomUUID } from "expo-crypto";

// One UUID per app session, stable until the app process ends: sent as `session_id` with every promotion, event and quote request.
// Dismissal applies only to this session.
let id = "";
export const promotionSessionId = (): string => (id ||= randomUUID());
