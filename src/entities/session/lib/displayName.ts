import type { User } from "../model/types";

// The name every header greets the account with, the same on every page: the full name the backend keeps ("LexGo Yuristi"),
// or first + last name when that is empty. Never shortened to the first word.
export function displayName(user?: Pick<User, "name" | "firstName" | "lastName"> | null): string {
  if (!user) return "";
  const tidy = (s?: string) => (s ?? "").replace(/\s+/g, " ").trim();
  return tidy(user.name) || tidy([user.firstName, user.lastName].filter(Boolean).join(" "));
}
