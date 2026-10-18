import { listSellerRequests, normSellerRequest } from "./sellerApi";

const mockHttp = jest.fn();
jest.mock("@/shared/api", () => ({ http: (...a: unknown[]) => mockHttp(...a) }));

describe("seller requests", () => {
  it("joins the name parts when no full name is sent", () => {
    expect(normSellerRequest({ id: 1, last_name: "Aliyev", first_name: "Vali", status: "pending" })).toMatchObject({ id: "1", name: "Aliyev Vali", status: "pending" });
  });
  it("reads the list and the counters", async () => {
    mockHttp.mockResolvedValue({ items: [{ id: "a", name: "X" }], stats: { total: 3, pending: 2, approved: 1, advokat_tashkiloti: 1 } });
    const feed = await listSellerRequests({ status: "pending", role: "", from: "", to: "" });
    expect(mockHttp).toHaveBeenCalledWith("/admin/seller-requests?status=pending");
    expect(feed.items).toHaveLength(1);
    expect(feed.stats).toMatchObject({ total: 3, pending: 2, approved: 1, advokatTashkiloti: 1, rejected: 0 });
  });
});
