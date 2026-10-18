import type { Payment } from "./types";

const PENDING = new Set(["pending", "processing", "created", "awaiting", "awaiting_payment", "waiting", "unpaid"]);

// A payment request that still waits for the provider; only the server flips it to paid.
export const isPendingPayment = (p: Payment): boolean => PENDING.has(p.status);
