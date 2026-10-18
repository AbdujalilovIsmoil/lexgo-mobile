import { ApiError } from "@/shared/api";

// A route the backend has not shipped answers 404 (unknown path), 405 (method) or 501.
export const isMissingRoute = (e: unknown): boolean => e instanceof ApiError && (e.status === 404 || e.status === 405 || e.status === 501);
