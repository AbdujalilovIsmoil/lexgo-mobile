import type { Messages } from "../uz";

export const aw11: Messages["aw11"] = {
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  priority: { low: "Low", medium: "Medium", high: "High" },
  caseStatus: {
    new: "New",
    active: "Active",
    open: "Open",
    investigation: "Investigation",
    court: "Court",
    appeal: "Appeal",
    completed: "Completed",
    archived: "Archived",
  },
  stage: {
    new: "New",
    accepted: "Accepted",
    filed: "Filed",
    in_progress: "In progress",
    court: "Court",
    appeal: "Appeal",
    completed: "Completed",
  },
  eventType: {
    hearing: "Court hearing",
    investigative: "Investigative action",
    meeting: "Meeting",
    filing_deadline: "Filing deadline",
    appeal_deadline: "Appeal deadline",
    deadline: "Deadline",
  },
};
