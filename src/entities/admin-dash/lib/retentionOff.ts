import { ApiError } from "@/shared/api";

// The retention module can be switched off on the server (404 "retention_removed" on every /retention/* route).
export const isRetentionOff = (e: unknown): boolean => e instanceof ApiError && e.status === 404;
