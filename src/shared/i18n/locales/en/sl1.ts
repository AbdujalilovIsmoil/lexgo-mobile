import type { Messages } from "../uz";

export const sl1: Messages["sl1"] = {
  state: {
    incomplete: "Application in progress",
    ready: "Ready to submit",
    submitted: "Under review",
    approved: "Approved",
    rejected: "Rejected",
  },
  badge: {
    incomplete: "In progress",
    ready: "Ready",
    submitted: "Pending",
    approved: "Active",
    rejected: "Rejected",
  },
  stateText: {
    incomplete: "Complete all required steps, then send your application for review.",
    ready: "All steps are done. You can send the application to a moderator.",
    submitted: "A moderator is reviewing your application. This usually takes about 24 hours.",
    approved: "Your profile is approved: you are listed in the marketplace and can sell services.",
    rejected: "The application was rejected. Fix the details and send it again.",
  },
  notPublic: "Until approved, your profile is not listed in the marketplace and you cannot sell services.",
  verified: "Verified",
  unverified: "Not verified",
  kind: { advokat: "Advocate", yurist: "Lawyer", advokat_tashkiloti: "Law organization" },
};
