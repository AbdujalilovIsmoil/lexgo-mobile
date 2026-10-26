import type { Expect } from "./cases1";

export type UrlCase = [name: string, viewer: string, url: string, expect: Expect];

export const URL_CASES: UrlCase[] = [
  ["app scheme, client", "client", "lexgo://documents/D1", { href: "/documents/D1" }],
  ["app scheme, triple slash", "client", "lexgo:///notifications", { href: "/notifications" }],
  ["app scheme, tab", "client", "lexgo://messages", { href: "/(tabs)/messages" }],
  ["app scheme, query kept", "client", "lexgo://call/r1?callId=c1&x=1", { href: "/call/r1?callId=c1" }],
  ["app scheme, seller area for seller", "seller", "lexgo://pro/docs", { href: "/pro/docs" }],
  ["app scheme, seller area for client", "client", "lexgo://pro/docs", { kind: "blocked", fallback: "/" }],
  ["app scheme, removed organisation area", "seller", "lexgo://org/workload", { kind: "blocked", fallback: "/(tabs)/workspace" }],
  ["app scheme, removed admin area", "client", "lexgo://manage/roles", { kind: "blocked", fallback: "/" }],
  ["app scheme, removed call-centre area", "seller", "lexgo://cc/calls", { kind: "blocked" }],
  ["app scheme, unknown screen", "client", "lexgo://nope/1", { kind: "blocked" }],
  ["traversal", "client", "lexgo://documents/../manage/roles", { kind: "blocked" }],
  ["website, locale stripped", "client", "https://lexgo.uz/ru/lawyers/abc", { href: "/lawyer/abc" }],
  ["website portal chat", "client", "https://lexgo.uz/uz/portal/chat/r1", { href: "/chat/r1" }],
  ["website portal support ticket", "client", "https://www.lexgo.uz/portal/client/support?ticket=t1", { href: "/support/t1" }],
  ["website portal cases, seller", "seller", "https://lexgo.uz/portal/lawyer/cases", { href: "/pro/cases" }],
  ["website admin panel has no app screen", "client", "https://lexgo.uz/uz/admin/payouts", { kind: "blocked" }],
  ["website opportunities, seller", "seller", "https://lexgo.uz/uz/portal/advocate/opportunities", { href: "/pro/market" }],
  ["foreign https host", "client", "https://lexgo.uz.evil.com/portal/client", { kind: "blocked" }],
  ["plain http", "client", "http://lexgo.uz/portal/client", { kind: "blocked" }],
  ["javascript scheme", "client", "javascript:alert(1)", { kind: "blocked" }],
  ["intent scheme", "client", "intent://x#Intent;scheme=lexgo;end", { kind: "blocked" }],
  ["file scheme", "client", "file:///etc/passwd", { kind: "blocked" }],
  ["control characters", "client", "lexgo://documents/1\n2", { kind: "blocked" }],
];
