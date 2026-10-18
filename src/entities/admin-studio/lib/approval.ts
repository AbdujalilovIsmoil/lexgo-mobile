import type { StudioConstructor } from "../model/types";

// K16 (directories) goes live on submit: no approval steps.
export const isApprovalFree = (code: string, ctor?: StudioConstructor | null): boolean => (ctor ? !ctor.approvalRequired : code === "K16");
