import { postPromoEvent } from "../api/soApi";
import { resetTracked, trackPromo, wasTracked } from "./track";

jest.mock("../api/soApi", () => ({ postPromoEvent: jest.fn() }));
jest.mock("./session", () => ({ promotionSessionId: () => "sess" }));

const post = postPromoEvent as jest.Mock;
const p = { eventUrl: "/e", orderId: "o1", placement: "in_progress" as const };

beforeEach(() => { post.mockReset(); resetTracked(); });

describe("trackPromo", () => {
  it("sends an event once per order, placement, session and event — rerenders do not repeat it", async () => {
    post.mockResolvedValue(true);
    await Promise.all([trackPromo(p, "impression"), trackPromo(p, "impression"), trackPromo(p, "impression")]);
    expect(post).toHaveBeenCalledTimes(1);
    expect(wasTracked(p, "impression")).toBe(true);
  });
  it("a different event or placement is its own event", async () => {
    post.mockResolvedValue(true);
    await trackPromo(p, "impression");
    await trackPromo(p, "click");
    await trackPromo({ ...p, placement: "completed" }, "impression");
    expect(post).toHaveBeenCalledTimes(3);
  });
  it("a failed send is forgotten so it can be sent later", async () => {
    post.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await trackPromo(p, "dismiss");
    expect(wasTracked(p, "dismiss")).toBe(false);
    await trackPromo(p, "dismiss");
    expect(post).toHaveBeenCalledTimes(2);
  });
  it("sends nothing without an event url", async () => {
    await trackPromo({ ...p, eventUrl: "" }, "impression");
    expect(post).not.toHaveBeenCalled();
  });
});
