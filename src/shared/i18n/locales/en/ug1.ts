import type { Messages } from "../uz";

export const ug1: Messages["ug1"] = {
  title: "Urgent advocate",
  lead: "Reach an advocate right now: a video or chat consultation, or a second opinion from another advocate.",
  metaMinutes: "Meeting",
  metaFree: "Free extension",
  metaPaid: "Paid extension",
  perMinute: "{price} UZS / min",
  about: {
    video_consultation_kind: "A video meeting with an advocate, in two kinds: ordinary (by queue) and express (straight to the advocate on duty).",
    second_opinion: "An independent opinion from another advocate — one, or a panel of them.",
    video_consultation: "A 30-minute video meeting with an advocate. Your request queues and a free advocate on duty takes it.",
    express_video_consultation: "Goes straight to the advocate on duty — no shared queue. For situations that cannot wait.",
    traffic_accident_consultation: "An immediate line to the on-duty advocate who handles road accidents.",
    chat_consultation: "In writing: you and the advocate talk in a secure chat, with no meeting to attend.",
    second_opinion_single: "A different advocate judges your case independently. Open to every client.",
    second_opinion_group: "Two to seven advocates give their opinion together. Needs an earlier advocate or lawyer service through LexGo.",
  },
  groups: { second_opinion: "Second opinion", video_consultation_kind: "Video consultation with an advocate" },
  from: "from {price} UZS",
  fromPerLawyer: "from {price} UZS per advocate",
  priorShort: "Needs a previous service",
  kindsN: "{n} kinds",
  mine: "My requests",
  mineEmpty: "No requests",
  mineEmptyText: "Pick a service above and send your first request.",
  docsCta: "Prepare a document with an advocate",
};
