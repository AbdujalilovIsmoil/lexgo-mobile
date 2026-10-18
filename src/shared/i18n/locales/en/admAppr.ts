import type { Messages } from "../uz";

export const admAppr: Messages["admAppr"] = {
  lead: "Refunds and lawyer replacements need admin + manager approval.",
  item: "Approval",
  admin: "Admin",
  manager: "Manager",
  adminApprove: "Admin approve",
  managerApprove: "Manager approve",
  confirmText: "Approve the {type} request {id}?",
  done: "Approved",
  empty: "No approvals",
  emptyText: "Pending approvals will appear here.",
  status: { admin_approved: "Admin approved", manager_approved: "Manager approved", partial: "Partial" },
  type: {
    payout: "Payout",
    refund: "Refund",
    plan_change: "Plan change",
    verification: "Verification",
    service: "Service",
    ad: "Ad",
    withdrawal: "Withdrawal",
    advocate_change: "Lawyer change",
    seller_register: "Seller registration",
    organization_create: "Organization creation",
  },
};
