import { redirectSystemPath as redirect } from "@/core/links/nativeIntent";

// Every incoming URL (lexgo://… and https://lexgo.uz/…) passes through here first; see core/links.
export const redirectSystemPath = redirect;
