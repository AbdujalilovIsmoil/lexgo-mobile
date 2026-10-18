import type { Messages } from "../uz";

export const ag3: Messages["ag3"] = {
  search: "Name, phone or LexGo ID",
  count: "{n} users",
  empty: "No users found",
  emptyText: "Change the search or the filter",
  saved: "Saved",
  deleted: "User deleted",
  facts: { id: "LexGo ID", phone: "Phone", role: "Primary role", roles: "Roles", perms: "Permissions", ref: "Referral code", by: "Invited by", verified: "Phone verified", created: "Registered" },
  act: { edit: "Edit", c360: "Client 360", block: "Block", unblock: "Activate", del: "Delete", roles: "Assign role" },
  edit: { title: "Edit profile", first: "First name", last: "Last name", middle: "Middle name", status: "Account status" },
  confirm: {
    blockTitle: "Block this account?", blockText: "{name} will not be able to sign in. You can activate it again later.",
    delTitle: "Delete this user?", delText: "{name}'s account will be marked as deleted (soft delete).",
  },
  c360: {
    sub: "Everything about the client in one place", orders: "Orders", cases: "Cases", payments: "Payments", spent: "Spent", leads: "Leads",
    chats: "Chats", complaints: "Complaints", reviews: "Reviews", subs: "Subscriptions", activity: "Activity", none: "No records",
  },
};
