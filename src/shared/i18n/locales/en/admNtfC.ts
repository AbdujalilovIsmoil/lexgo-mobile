import type { Messages } from "../uz";

export const admNtfC: Messages["admNtfC"] = {
  sent: "Sent",
  failed: "Not sent",
  results: "Results: {ok} of {total} sent",
  queuedNote: "Channels whose provider isn't connected yet are queued and will be delivered once it is.",
  resultOk: "Sent to {n} recipients.",
  resultPartial: "Sent: {ok}, failed: {fail}.",
  stopped: "Sending stopped: {done}/{total} sent.",
  channel: { in_app: "In-app", push: "Push", telegram: "Telegram", email: "Email", sms: "SMS" },
  delivery: { delivered: "Delivered", pending: "Waiting", failed: "Not delivered", unknown: "Unknown" },
};
