import type { Messages } from "../uz";

export const ttm: Messages["ttm"] = {
  title: "Team tasks", lead: "Every task of the team: its status, deadline and who it is assigned to.", create: "New task", retry: "Retry", empty: "No tasks yet",
  emptyFiltered: "No tasks match these filters", clearFilters: "Clear filters", denied: "You may not view tasks.", all: "All", updated: "Updated: {when}",
  moved: "{code}: moved to \"{status}\"", returned: "{code} sent back for rework", deletedOk: "{code} deleted", createdOk: "{code} created", saved: "{code} saved",
  noDeadline: "No deadline", overdue: "Overdue", unassigned: "Unassigned", deleted: "Deleted", edit: "Edit", assign: "Assignees", delete: "Delete", cancel: "Cancel",
  reasonNeeded: "Write a comment — it cannot be empty.", status: { new: "New", in_progress: "In progress", testing: "Testing", ready: "Ready" },
  act: { in_progress: "Start", testing: "Send to testing", ready: "Approve as ready", return: "Send back for rework" },
  filter: { title: "Filters", assignee: "Assignee", anyone: "Anyone", me: "Assigned to me", unassigned: "Unassigned", deadline: "Deadline", search: "Search by code, title or description", apply: "Apply", reset: "Reset" },
  err: { load: "Could not load the tasks", save: "Could not save. Try again.", network: "No internet. Your data is kept — try again.", unavailable: "The service is temporarily down. Your data is kept — try again shortly.", missing: "The task was not found or was deleted.", forbidden: "You may not do this.", conflict: "The task was changed elsewhere — its new state was loaded.", conflictNotice: "This task was updated on another device. Review the changes and repeat the action." },
  form: { createTitle: "New task", editTitle: "{code} — edit", assignTitle: "{code} — assignees", createBtn: "Create", save: "Save", name: "Title", titleNeeded: "Write the task title.", description: "Description", deadline: "Deadline", date: "Date", time: "Time", deadlineNeeded: "Choose a deadline.", deadlineFuture: "The deadline must be in the future.", assignees: "Assignees", assigneesPh: "Choose assignees", assigneesSearch: "Name, LexGo ID or phone", assigneesEmpty: "Nobody found", unassignedHint: "A task created without an assignee sends the person in charge a Telegram request to assign it.", quick: "Quick pick", today: "Today 18:00", tomorrow: "Tomorrow 10:00", days3: "In 3 days", week: "In a week", done: "Done" },
  detail: { returned: "Sent back for rework", deadline: "Deadline", assignees: "Assignees", creator: "Created by", updated: "Last change", readyBy: "Approved by", deleteReason: "Reason for deleting", noDescription: "No description.", history: "History", noHistory: "No history." },
  history: { created: "Created", updated: "Edited", assignees_changed: "Assignees changed", status_changed: "Status changed", returned: "Sent back", deleted: "Deleted" },
  returnTitle: "{code} — send back for rework", returnLead: "The task goes back to \"In progress\". The comment reaches the assignees on Telegram and shows in the history.", returnLabel: "What must be fixed",
  deleteTitle: "{code} — delete", deleteLead: "The task leaves the list; its history stays.", deleteLabel: "Reason for deleting",
  due: { today: "Today {time}", tomorrow: "Tomorrow {time}", yesterday: "Yesterday {time}" }, peopleCount: "{n} assignees",
  kpi: { created: "Given today", done: "Done today", open: "Not done", openLate: "{n} overdue", unassigned: "{n} tasks unassigned" },
  progress: { title: "Completion", foot: "{done} of {total} tasks are ready", late: "{n} tasks overdue" },
};
