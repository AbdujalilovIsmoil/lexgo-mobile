import { ApiError } from "./errors";
import { bindAuth, http } from "./http";

const reply = (status: number, body?: unknown) => ({ ok: status < 400, status, headers: { get: () => null }, json: async () => body ?? {}, text: async () => (body === undefined ? "" : JSON.stringify(body)) }) as unknown as Response;
const sent = () => (global.fetch as jest.Mock).mock.calls;

beforeEach(() => { global.fetch = jest.fn(); bindAuth(() => "tok1", null); });

describe("http", () => {
  it("sends the bearer token and parses JSON", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(reply(200, { ok: 1 }));
    await expect(http("/ping")).resolves.toEqual({ ok: 1 });
    expect(sent()[0][1].headers.Authorization).toBe("Bearer tok1");
    expect(sent()[0][0]).toMatch(/\/ping$/);
  });
  it("returns undefined for 204", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(reply(204));
    await expect(http("/gone", { method: "DELETE" })).resolves.toBeUndefined();
  });
  it("throws a parsed ApiError on failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(reply(422, { detail: [{ loc: ["body", "phone"], msg: "bad" }] }));
    await expect(http("/x", { method: "POST", body: {} })).rejects.toMatchObject({ status: 422, fieldErrors: { phone: "bad" } });
  });
  it("turns a dead network into ApiError(0)", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("offline"));
    await expect(http("/net")).rejects.toBeInstanceOf(ApiError);
    await expect(http("/net2")).rejects.toMatchObject({ status: 0 });
  });
  it("refreshes the token once on 401 and retries", async () => {
    let token = "old";
    bindAuth(() => token, async () => (token = "fresh"));
    (global.fetch as jest.Mock).mockResolvedValueOnce(reply(401, {})).mockResolvedValueOnce(reply(200, { v: 2 }));
    await expect(http("/secure")).resolves.toEqual({ v: 2 });
    expect(sent()).toHaveLength(2);
    expect(sent()[1][1].headers.Authorization).toBe("Bearer fresh");
  });
  it("asks the backend once for the same GET made twice at the same time", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(reply(200, { n: 1 }));
    await Promise.all([http("/same"), http("/same")]);
    expect(sent()).toHaveLength(1);
  });
});
