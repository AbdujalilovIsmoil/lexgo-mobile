import type { Messages } from "../uz";

export const dm2: Messages["dm2"] = {
  status: {
    questionnaire: "Being filled in",
    draft: "Draft",
    ready_to_generate: "Ready to generate",
    payment_pending: "Payment pending",
    payment_required: "Extra payment pending",
    awaiting_payment: "Payment pending",
    pending_payment: "Payment pending",
    lawyer_review_requested: "Sent to advocate",
    open_pool: "Waiting for a duty advocate",
    claimed: "Advocate took it",
    lawyer_review: "Advocate is preparing it",
    file_ready: "Document ready",
    rated: "Rated",
    closed: "Closed",
    payment_cancelled: "Payment cancelled",
    payment_rejected: "Payment rejected",
    cancelled: "Cancelled",
    rejected: "Rejected",
  },
  next: { draft: "Fill in the details and create the document", payment: "Waiting for payment confirmation", review: "The duty advocate is on it — follow it here", ready: "Download the finished document" },
  step: { fill: "Details", pay: "Payment", review: "Advocate", ready: "Ready" },
  stepState: {
    done: "Done",
    now: "Now",
    todo: "Next",
    skip: "Not needed",
    fail: "Stopped",
    paid: "Paid",
  },
};
