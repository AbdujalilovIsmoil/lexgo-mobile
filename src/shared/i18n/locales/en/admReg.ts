import type { Messages } from "../uz";

export const admReg: Messages["admReg"] = {
  lead: "Lawyer and advocate registration requests",
  role: { advokat: "Advocate", yurist: "Lawyer", advokat_tashkiloti: "Advocate organization" },
  roleLabel: "Role",
  status: { approval_pending: "Awaiting approval", accepted: "Accepted" },
  accept: "Accept",
  reject: "Reject",
  acceptTitle: "Accept this request?",
  acceptText: "{name} will be approved as a seller.",
  rejectTitle: "Reject this request?",
  rejectText: "The registration request of {name} will be rejected.",
  acceptedDone: "Request accepted",
  rejectedDone: "Request rejected",
  empty: "No requests",
  emptyText: "No requests match the selected filters.",
};
