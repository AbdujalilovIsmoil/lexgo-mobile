import type { Messages } from "../uz";

export const cl5: Messages["cl5"] = {
  next: {
    readConclusion: "Read the conclusion",
    viewAndRate: "See the result and rate it",
    followRequest: "Follow the request status",
    downloadDoc: "Download the finished document",
    followLawyer: "Follow the lawyer's progress",
    operatorReviews: "The call-center operator is reviewing the complaint",
  },
  pay: { title: "Payment", free: "Free", waiting: "The status updates once the server confirms the payment.", open: "Open payments" },
  rating: {
    title: "Rating and complaint",
    left: "Time left: {time}",
    hint: "You can rate the work or file a complaint within 15 minutes of completion.",
    cta: "Rate now",
    rated: "Rated: {date}",
    closed: "The time to rate or complain has passed.",
  },
  complaint: { title: "Complaint", operator: "Operator's note" },
};
