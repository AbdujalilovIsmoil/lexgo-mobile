import type { PillTone } from "@/shared/ui";

// The groups the advocate works through, each one is a server-side `?status=` filter.
export type DocTab = "claimed" | "new" | "pending_payment" | "completed" | "all";
export const DOC_TABS: DocTab[] = ["claimed", "new", "pending_payment", "completed", "all"];

// Records that went through the pool flow open the system editor; older ones are upload-only.
const EDITOR_FLOW = ["open_pool", "claimed", "completed"];
export const isEditorFlow = (status: string): boolean => EDITOR_FLOW.includes(status);

const TONE: Record<string, PillTone> = { open_pool: "blue", new: "warn", claimed: "cy", pending_payment: "gray", completed: "ok", cancelled: "err", rejected: "err" };
export const statusTone = (status: string): PillTone => TONE[status] ?? "gray";

export const FLOWS = ["template_lawyer_assisted", "custom_from_scratch", "review_existing_document"] as const;
export const LATE_MS = 24 * 3600 * 1000;
