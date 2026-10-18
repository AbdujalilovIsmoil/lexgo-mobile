import type { Messages } from "../uz";

export const au4: Messages["au4"] = {
  pending: {
    title: "Account awaiting approval",
    text: "An administrator is reviewing your account. You can complete your profile; order and client actions open after approval.",
  },
  blocked: {
    title: "Account blocked",
    text: "Your account was blocked by an administrator. Contact support for details.",
  },
  deleted: { title: "Account deleted", text: "This account no longer exists. You can create a new one." },
  rejected: {
    title: "Request rejected",
    text: "Your account request was rejected. Write to support if you have questions.",
  },
  restricted: {
    title: "Account unavailable",
    text: "Your account is not active right now. Refresh the status or contact support.",
  },
  onboarding: "Complete profile",
  proceed: "Continue to the app",
  recheck: "Refresh status",
  stillSame: "The account status has not changed yet.",
};
