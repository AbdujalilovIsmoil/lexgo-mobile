import type { Messages } from "../uz";

export const admStudioD: Messages["admStudioD"] = {
  cards: { services: "Services", packages: "Packages", total: "total", active: "active", inactive: "inactive", incomplete: "incomplete", create: "Create", open: "List" },
  journeys: {
    title: "Launch journeys", sub: "Step-by-step creation flows", empty: "No journeys", emptyText: "Create a new service or package step by step.",
    new: "New journey", name: "Name", namePh: "For example: contract review service", type: "Type", start: "Start", progress: "{done}/{total} steps", step: "Step", resume: "Resume",
    markDone: "Mark as done", markUndone: "Clear the mark", openForm: "Open the form", abandon: "Abandon", archive: "Archive", restore: "Restore",
    abandonQ: "Abandon this journey?", archiveQ: "Archive this journey?", done: "Done", current: "Current", missing: "Pending", required: "Required",
    status: { draft: "Draft", in_progress: "In progress", completed: "Completed", abandoned: "Abandoned", archived: "Archived" },
    types: { service: "Simple service", marketplace_service: "Service and package", document_service: "Document service", subscription: "Plan", consultation: "Consultation", promotion: "Promotion", integration: "Integration" },
    created: "Journey created", updated: "Updated", all: "All", active: "Active",
  },
};
