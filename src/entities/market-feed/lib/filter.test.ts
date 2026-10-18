import { activeCount, applyFilters, NO_FILTERS, regionsOf, type Job } from "./filter";

const now = new Date(2026, 9, 18, 15, 0).getTime();
const j = (id: string, o: Partial<Job>): Job => ({ id, workId: id, title: "", serviceName: "Xizmat", status: "new", paymentStatus: "", region: "", createdAt: new Date(2026, 9, 18, 9).toISOString(), deadlineAt: "", ...o });
const rows = [
  j("a", { region: "Toshkent", amount: 200_000, serviceName: "Mehnat nizosi", createdAt: new Date(2026, 9, 18, 10).toISOString(), deadlineAt: new Date(2026, 9, 18, 16).toISOString() }),
  j("b", { region: "Samarqand", amount: 800_000, title: "Ijara shartnomasi", createdAt: new Date(2026, 9, 15).toISOString() }),
  j("c", { region: "Toshkent", amount: 2_500_000, createdAt: new Date(2026, 9, 10).toISOString(), deadlineAt: new Date(2026, 9, 19).toISOString() }),
  j("d", { region: "", createdAt: new Date(2026, 9, 17).toISOString() }),
];
const ids = (r: Job[]) => r.map((x) => x.id);

it("keeps everything and sorts newest first by default", () => expect(ids(applyFilters(rows, NO_FILTERS, now))).toEqual(["a", "d", "b", "c"]));
it("searches service, text, region and number", () => {
  expect(ids(applyFilters(rows, { ...NO_FILTERS, q: " mehnat " }, now))).toEqual(["a"]);
  expect(ids(applyFilters(rows, { ...NO_FILTERS, q: "ijara" }, now))).toEqual(["b"]);
  expect(ids(applyFilters(rows, { ...NO_FILTERS, q: "samar" }, now))).toEqual(["b"]);
});
it("filters by region and by budget band", () => {
  expect(ids(applyFilters(rows, { ...NO_FILTERS, region: "Toshkent" }, now))).toEqual(["a", "c"]);
  expect(ids(applyFilters(rows, { ...NO_FILTERS, budget: "low" }, now))).toEqual(["a"]);
  expect(ids(applyFilters(rows, { ...NO_FILTERS, budget: "mid" }, now))).toEqual(["b"]);
  expect(ids(applyFilters(rows, { ...NO_FILTERS, budget: "high" }, now))).toEqual(["c"]);
});
it("filters by when it arrived", () => {
  expect(ids(applyFilters(rows, { ...NO_FILTERS, when: "today" }, now))).toEqual(["a"]);
  expect(ids(applyFilters(rows, { ...NO_FILTERS, when: "week" }, now))).toEqual(["a", "d", "b"]);
});
it("sorts by budget and by the nearest response deadline (none last)", () => {
  expect(ids(applyFilters(rows, { ...NO_FILTERS, sort: "budgetDesc" }, now))).toEqual(["c", "b", "a", "d"]);
  expect(ids(applyFilters(rows, { ...NO_FILTERS, sort: "budgetAsc" }, now))).toEqual(["d", "a", "b", "c"]);
  expect(ids(applyFilters(rows, { ...NO_FILTERS, sort: "deadline" }, now))).toEqual(["a", "c", "d", "b"]);
  expect(ids(applyFilters(rows, { ...NO_FILTERS, sort: "old" }, now))).toEqual(["c", "b", "d", "a"]);
});
it("counts the non-default choices and lists regions by size", () => {
  expect(activeCount(NO_FILTERS)).toBe(0);
  expect(activeCount({ q: "x", region: "T", budget: "low", when: "week", sort: "old" })).toBe(4);
  expect(regionsOf(rows)).toEqual([{ name: "Toshkent", count: 2 }, { name: "Samarqand", count: 1 }]);
});
