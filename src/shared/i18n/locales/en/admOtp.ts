import type { Messages } from "../uz";

export const admOtp: Messages["admOtp"] = {
  lead: "Staging/demo only. OTP codes are no longer returned in responses, so they show up here.",
  tapHint: "Tap a code to copy it.",
  empty: "No test OTPs yet",
  stagingOnly: "Staging only",
  stagingOnlyText: "Test OTP codes are kept only on the staging/demo server. Production has no such list: codes are sent by SMS or Telegram.",
};
