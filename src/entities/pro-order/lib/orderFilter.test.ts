import type { ProOrder } from "../model/types";
import { applyOrderFilters, NO_ORDER_FILTERS, orderActiveCount } from "./orderFilter";
import { hintOf } from "./hint";

const now = new Date(2026, 9, 18, 15, 0).getTime();
const o = (id: string, p: Partial<ProOrder>): ProOrder => ({ id, workId: id, status: "paid", paymentStatus: "paid", serviceTitle: "Xizmat", price: 100_000, buyerName: "", createdAt: new Date(2026, 9, 18, 9).toISOString(), additional: null, canComplete: false, ...p }) as ProOrder;
const rows = [
  o("a", { price: 200_000, serviceTitle: "Mehnat nizosi", buyerName: "Ali", createdAt: new Date(2026, 9, 18, 10).toISOString() }),
  o("b", { price: 800_000, status: "in_progress", createdAt: new Date(2026, 9, 15).toISOString() }),
  o("c", { price: 2_500_000, status: "completed", createdAt: new Date(2026, 8, 25).toISOString() }),
  o("d", { price: 0, status: "cancelled", createdAt: new Date(2026, 9, 17).toISOString() }),
];
const ids = (r: ProOrder[]) => r.map((x) => x.id);

it("keeps all and sorts newest first", () => expect(ids(applyOrderFilters(rows, NO_ORDER_FILTERS, now))).toEqual(["a", "d", "b", "c"]));
it("searches service, id and client", () => {
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, q: " mehnat " }, now))).toEqual(["a"]);
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, q: "ali" }, now))).toEqual(["a"]);
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, q: "b" }, now))).toEqual(["b"]);
});
it("filters by stage, price band and period", () => {
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, stage: "active" }, now))).toEqual(["b"]);
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, price: "low" }, now))).toEqual(["a", "d"]);
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, price: "high" }, now))).toEqual(["c"]);
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, when: "today" }, now))).toEqual(["a"]);
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, when: "week" }, now))).toEqual(["a", "d", "b"]);
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, when: "month" }, now))).toEqual(["a", "d", "b", "c"]);
});
it("sorts by price and age", () => {
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, sort: "priceDesc" }, now))).toEqual(["c", "b", "a", "d"]);
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, sort: "priceAsc" }, now))).toEqual(["d", "a", "b", "c"]);
  expect(ids(applyOrderFilters(rows, { ...NO_ORDER_FILTERS, sort: "old" }, now))).toEqual(["c", "b", "d", "a"]);
});
it("counts non-default choices", () => {
  expect(orderActiveCount(NO_ORDER_FILTERS)).toBe(0);
  expect(orderActiveCount({ q: "x", stage: "new", when: "week", price: "low", sort: "old" })).toBe(4);
});
it("hints at the next action", () => {
  expect(hintOf(rows[0])).toBe("accept");
  expect(hintOf(rows[1])).toBe("work");
  expect(hintOf(rows[2])).toBeNull();
});
