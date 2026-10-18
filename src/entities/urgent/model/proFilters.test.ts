import type { UrgentRequest } from "./requestTypes";
import { activeProCount, ageOf, applyProFilters, heatOf, NO_PRO_FILTERS, statusCounts, stepOf } from "./proFilters";

const now = new Date(2026, 9, 18, 15, 0).getTime();
const at = (d: number, h = 9) => new Date(2026, 9, d, h).toISOString();
const r = (id: string, o: Partial<UrgentRequest>) => ({ id, workId: id, serviceTitle: "", clientName: "", clientPhone: "", need: "", status: "open_pool", createdAt: at(18), ...o }) as UrgentRequest;
const rows = [
  r("a", { status: "claimed", clientName: "Aziz", createdAt: at(18, 10) }),
  r("b", { status: "completed", need: "Ijara", createdAt: at(17) }),
  r("c", { status: "meeting_active", createdAt: at(18, 12) }),
  r("d", { status: "open_pool", createdAt: at(10) }),
  r("e", { status: "cancelled", createdAt: at(18, 8) }),
];
const ids = (x: UrgentRequest[]) => x.map((y) => y.id);

it("puts the live meeting first, finished last, oldest waiting first inside a rank", () => expect(ids(applyProFilters(rows, NO_PRO_FILTERS, now))).toEqual(["c", "a", "d", "e", "b"]));
it("sorts by waiting, newest and oldest", () => {
  expect(ids(applyProFilters(rows, { ...NO_PRO_FILTERS, sort: "waiting" }, now))).toEqual(["d", "a", "c", "b", "e"]);
  expect(ids(applyProFilters(rows, { ...NO_PRO_FILTERS, sort: "new" }, now))).toEqual(["c", "a", "e", "b", "d"]);
  expect(ids(applyProFilters(rows, { ...NO_PRO_FILTERS, sort: "old" }, now))).toEqual(["d", "b", "e", "a", "c"]);
});
it("filters by status, period and search", () => {
  expect(ids(applyProFilters(rows, { ...NO_PRO_FILTERS, status: "claimed" }, now))).toEqual(["a"]);
  expect(ids(applyProFilters(rows, { ...NO_PRO_FILTERS, period: "today" }, now))).toEqual(["c", "a", "e"]);
  expect(ids(applyProFilters(rows, { ...NO_PRO_FILTERS, period: "week" }, now))).toEqual(["c", "a", "e", "b"]);
  expect(ids(applyProFilters(rows, { ...NO_PRO_FILTERS, q: " ijara " }, now))).toEqual(["b"]);
});
it("counts statuses ignoring the chosen status but honouring period and search", () => {
  expect(statusCounts(rows, NO_PRO_FILTERS, now)).toEqual({ "": 5, claimed: 1, completed: 1, meeting_active: 1, open_pool: 1, cancelled: 1 });
  expect(statusCounts(rows, { ...NO_PRO_FILTERS, status: "claimed", period: "today" }, now)).toEqual({ "": 3, claimed: 1, meeting_active: 1, cancelled: 1 });
});
it("counts the non-default choices", () => {
  expect(activeProCount(NO_PRO_FILTERS)).toBe(0);
  expect(activeProCount({ q: "x", status: "claimed", period: "week", sort: "old" })).toBe(3);
});
it("maps statuses to the four-step track", () => {
  expect(rows.map(stepOf)).toEqual([1, 3, 2, 0, -1]);
});
it("splits an age and rates its heat", () => {
  expect(ageOf(20_000)).toEqual({ key: "now", n: 0, m: 0 });
  expect(ageOf(12 * 60_000)).toEqual({ key: "min", n: 12, m: 0 });
  expect(ageOf(125 * 60_000)).toEqual({ key: "hour", n: 2, m: 5 });
  expect(ageOf(3 * 86_400_000)).toEqual({ key: "day", n: 3, m: 0 });
  expect([5, 30, 90].map((m) => heatOf(m * 60_000))).toEqual(["calm", "warm", "hot"]);
});
