import type { Messages } from "../uz";

export const rp: Pick<Messages, "rp"> = {
  rp: {
    title: "Report a problem",
    sub: "Describe the problem and our team will look into it",
    msg: "What went wrong?",
    ph: "For example: the payments page will not open",
    kind: "Type",
    urgent: "Urgent",
    urgentHint: "Turn on if your work is blocked",
    send: "Send",
    sent: "Report sent: {id}",
    sentPlain: "Report sent",
    failed: "Could not send. Please try again.",
    btn: "Report a problem",
  },
};
